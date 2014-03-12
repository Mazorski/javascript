using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mazor.Core.Communication.Signaling.Entry
{
	public sealed class ConnectionStrings
	{
		private string _sourceCId;
		private string _targetCId;

		public string SourceCId { get { return _sourceCId; } }
		public string TargetCId { get { return _targetCId; } }

		public ConnectionStrings (string sourceCId, string targetCId) : this(sourceCId, ref targetCId) { }
		public ConnectionStrings (string sourceCId, ref string targetCId)
		{
			if (string.IsNullOrEmpty(sourceCId)) { throw new ArgumentNullException("sourceCId"); }
			if (string.IsNullOrEmpty(targetCId)) { targetCId = sourceCId; }

			_sourceCId = sourceCId;
			_targetCId = targetCId;
		}
	}
}
