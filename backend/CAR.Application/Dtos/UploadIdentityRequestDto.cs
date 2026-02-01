namespace CAR.Application.Dtos
{
    public class UploadIdentityRequestDto
    {
        public string FrontDocumentUrl { get; set; } = null!;

        public string BackDocumentUrl { get; set; } = null!;

        public string SelfieUrl { get; set; } = null!;
    }
}
