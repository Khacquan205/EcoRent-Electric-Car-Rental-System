using System;

namespace CAR.Application.Exceptions
{
    public class UserFriendlyException : Exception
    {
        public int StatusCode { get; }
        public string ErrorCode { get; }

        public UserFriendlyException(int statusCode, string errorCode, string message) 
            : base(message)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
        }

        public UserFriendlyException(int statusCode, string errorCode, string message, Exception innerException) 
            : base(message, innerException)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
        }
    }
}
