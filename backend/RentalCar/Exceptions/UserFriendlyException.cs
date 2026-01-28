using ISCUBE.Domain.Enums;

namespace ISCUBE.Exceptions
{
    public class UserFriendlyException : Exception
    {
        public string MessageCode { get; set; }
        public string UserFriendlyMessage { get; set; }
        public ErrorCode ErrorCode { get; set; }

        public UserFriendlyException(ErrorCode errorCode, string userFriendlyMessage, string messageCode, Exception? innerException) : base(userFriendlyMessage, innerException)
        {
            MessageCode = messageCode;
            ErrorCode = errorCode;
            UserFriendlyMessage = userFriendlyMessage;
        }

        public UserFriendlyException(ErrorCode errorCode, string userFriendlyMessage, string messageCode) : this(errorCode, userFriendlyMessage, messageCode, null)
        {
        }
    }
}
