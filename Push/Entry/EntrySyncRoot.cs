using Mazor.Core.Communication.Signaling.Messaging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Entry
{
	public class EntrySyncRoot
	{
		private readonly ConnectionStrings _strings;
		private readonly NotificationSubject _subject;
		private readonly EntrySyncObject _entry;
		private readonly bool _isIncoming;
		private readonly DateTime _stamp = DateTime.UtcNow;
		private Action _syncDispose;
		private int? _depth;

		public event Action Disposing;

		public string SourceConnectionId { get { return _strings.SourceCId; } }
		public string TargetConnectionId { get { return _strings.TargetCId; } }
		public NotificationSubject Subject { get { return _subject; } }
		public EntrySyncObject Entry { get { return _entry; } }
		public bool IsIncoming { get { return _isIncoming; } }
		public DateTime TimeStamp { get { return _stamp; } }
		public bool IsReEntry { get { return this != Entry.Root; } }
		public bool IsSyncDisposed { get { return _syncDispose == null; } }

		public int Depth
		{
			get
			{
				if (_depth == null)
				{
					_depth = 0;

					var root = this;
					var sync = root.Entry;

					do { _depth++; }
					while (root != sync.Root && (root = root.Entry.Root) != null && (sync = root.Entry) != null);
				}

				return (int)_depth;
			}
		}

		public EntrySyncRoot (ConnectionStrings strings, NotificationSubject subject, EntrySyncObject entry, bool isIncoming, out Action disposing)
		{
			if (strings == null) { throw new ArgumentNullException("strings"); }
			if (subject == null) { throw new ArgumentNullException("subject"); }
			if (entry == null) { throw new ArgumentNullException("entry"); }

			_strings = strings;
			_subject = subject;
			_entry = entry;
			_isIncoming = isIncoming;

			disposing = _syncDispose = OnDisposing;
		}

		private void OnDisposing ()
		{
			if (_syncDispose == null) { throw new InvalidOperationException("Already been disposed"); }
			
			if (Disposing != null) { Disposing(); }
			_syncDispose = null;
		}
	}
}
