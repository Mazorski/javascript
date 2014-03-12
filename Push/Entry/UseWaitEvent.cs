using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Entry
{
	public class UseWaitEvent : WaitHandle
	{
		private Action<object> _use;
		private AutoResetEvent _event;

		public UseWaitEvent () : this(default(bool)) { }
		public UseWaitEvent (bool initialState)
		{
			_event = new AutoResetEvent(initialState);
			_use = o => { };
		}

		protected override void Dispose (bool explicitDisposing)
		{
			base.Dispose(explicitDisposing);
			_event.Dispose();
		}

		public void Use (object state)
		{
			_use(state);
			_event.Set();
		}

		public void SetCallUse (Action<object> sync)
		{
			_use += sync;
		}

		public override void Close ()
		{
			base.Close();
			_event.Close();
		}

		public override bool WaitOne ()
		{
			return _event.WaitOne();
		}

		public override bool WaitOne (int millisecondsTimeout)
		{
			return _event.WaitOne(millisecondsTimeout);
		}

		public override bool WaitOne (int millisecondsTimeout, bool exitContext)
		{
			return _event.WaitOne(millisecondsTimeout, exitContext);
		}

		public override bool WaitOne (TimeSpan timeout)
		{
			return _event.WaitOne(timeout);
		}

		public override bool WaitOne (TimeSpan timeout, bool exitContext)
		{
			return _event.WaitOne(timeout, exitContext);
		}
	}
}
