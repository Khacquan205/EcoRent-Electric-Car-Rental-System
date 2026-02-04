namespace CAR.Domain.Enums
{
    public enum KycVerificationStatus
    {
        None = 0,
        Pending = 1,        // OCR done
        PhonePending = 2,   // OTP sent
        PhoneVerified = 3,  // OTP confirmed
        Verified = 4,       // Final confirmed
        Rejected = 5
    }
}
