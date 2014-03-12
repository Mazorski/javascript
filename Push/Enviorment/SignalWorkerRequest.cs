using Mazor.Core.Communication.Signaling.Hubs;
using Mazor.Core.Communication.Signaling.Delegating;
using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Routing;
using Mazor.Core.Communication.Signaling.Entry;
using System.Threading;
using Mazor.Core.Communication.Signaling.Enviorment;

namespace Mazor.Core.Communication.Signaling.Entry
{
	public delegate void EndOfSignalWork (object caller);

	public class SignalWorkerRequest : IDisposable
	{
		#region Fields
		private SignalCallSite _site;
		private RawSignalSource _input;
		private SignalDelegatingHandler _delegatingHandler;
		private EntrySyncObject _entrySyncObj;

		private TextReader _signalSourceBodyReader;

		private string _outPutTargetCId;
		private Uri _outPutSignalAction;
		private TextWriter _outPutSignalBodyWriter;
		private StringBuilder _outPutSignalBodySb;
		private ICollection<Exception> _outPutSignalState;

		private bool _expectInputSignal;
		private bool _specifyOutPutSignalState;
		private bool _sendOutPutSignal;
		#endregion

		#region Properties
		public Guid SubjectId { get { return _input.Message.Subject.Id; } }
		public string SourceCId { get { return _input.ConnectionId; } }
		public string TargetCId { get { return _outPutTargetCId; } }
		public Uri Action { get { return _input.Message.Subject.Action; } }
		public SignalCallSite Site { get { return _site; } }
		public EntrySyncObject SyncObj { get { return _entrySyncObj; } }
		public SignalDelegatingHandler DelegatingHandler { get { return _delegatingHandler; } }
		public IDictionary<object, object> Items { get { return _input.Items; } }
		public HttpContextBase Http { get { return _input.Http; } }
		public bool SignaldEndOfWork { get; private set; }
		public TextReader InPutSignalBodyReader { get { return _signalSourceBodyReader; } }
		public Exception[] InPutSignalState { get { return _input.Message.Errors; } }
		public TextWriter OutPutSignalBodyWriter { get { return _outPutSignalBodyWriter; } }
		public ICollection<Exception> OutPutSignalState { get { return _outPutSignalState; } }
		public StringBuilder OutPutSignalBodySb { get { return _outPutSignalBodySb; } }
		public bool IsIncoming { get { return _input.IsIncoming; } }
		#endregion

		#region Events
		public event EndOfSignalWork EndOfWork;
		#endregion

		#region Constructors
		public SignalWorkerRequest (SignalCallSite site, RawSignalSource input, SignalDelegatingHandler delegatingHandler, ICollection<Exception> outPutState)
		{
			if (site == null) { throw new ArgumentNullException("site"); }
			if (input == null) { throw new ArgumentNullException("input"); }
			if (delegatingHandler == null) { throw new ArgumentNullException("delegatingHandler"); }
			if (outPutState == null) { throw new ArgumentNullException("outPutState"); }

			_site = site;
			_input = input;
			_delegatingHandler = delegatingHandler;

			_outPutTargetCId = _input.ConnectionId;
			_outPutSignalAction = input.Message.Subject.Action;
			_outPutSignalState = outPutState;

			if (input.IsIncoming)
			{
				_signalSourceBodyReader = new StringReader(input.Message.Body);
				_outPutSignalBodyWriter = new StringWriter(_outPutSignalBodySb = new StringBuilder());
				
				SendOutPutSignal(_input.Message.Subject.CallBack);
			}
			else
			{
				_signalSourceBodyReader = new StringReader(string.Empty);
				_outPutSignalBodyWriter = new StringWriter(_outPutSignalBodySb = new StringBuilder(input.Message.Body));
				_outPutSignalState.AddIncremental(input.Message.Errors);

				ExpectInputSignal(_input.Message.Subject.CallBack);
				SendOutPutSignal(true);
			}
		}
		#endregion

		#region Members
		public void Sync (EntrySyncObject syncObj)
		{
			if (SignaldEndOfWork) { throw new InvalidOperationException("SignaldEndOfWork"); }
			if (_entrySyncObj != null) { throw new InvalidOperationException("AlreadySynced"); }

			_entrySyncObj = new EntrySyncObject(_input, ref _outPutTargetCId, syncObj);
		}

		public string OutPutTargetCId (string targetCId = null)
		{
			if (string.IsNullOrEmpty(targetCId)) 
			{
				if (!_input.IsIncoming) { throw new InvalidOperationException("Out going messages have a bound connection target (input.SourceCId)"); }
				_outPutTargetCId = targetCId; 
			}

			return _outPutTargetCId;
		}

		public Uri OutPutSignalAction (Uri action = null)
		{
			if (action != null) { _outPutSignalAction = action; }

			return _outPutSignalAction;
		}

		public bool ExpectInputSignal (bool? expectSignal = null)
		{
			if (expectSignal != null) { _expectInputSignal = (bool)expectSignal; }

			return _expectInputSignal;
		}

		public bool SpecifyOutPutSignalState (bool? specifyState = null)
		{
			if (specifyState != null) 
			{ 
				_specifyOutPutSignalState = (bool)specifyState;

				if (_specifyOutPutSignalState == true) { SendOutPutSignal(true); }
			}

			return _specifyOutPutSignalState;
		}

		public bool SendOutPutSignal (bool? sendSignal = null)
		{
			if (sendSignal != null) { _sendOutPutSignal = (bool)sendSignal; }

			return _sendOutPutSignal;
		}

		public void SignalEndOfWork (object caller)
		{
			if (SignaldEndOfWork) { throw new InvalidOperationException("Worker already signald end of work"); }

			SignaldEndOfWork = true;
			EndOfWork(caller);
		}

		public void Dispose ()
		{
			_site = null;
			_input = null;
			_delegatingHandler = null;
			_entrySyncObj = null;
			_outPutSignalAction = null;
			_outPutSignalBodySb = null;
			_signalSourceBodyReader = null;
			_outPutSignalBodyWriter = null;
			_outPutSignalState = null;
		}
		#endregion
	}
}
