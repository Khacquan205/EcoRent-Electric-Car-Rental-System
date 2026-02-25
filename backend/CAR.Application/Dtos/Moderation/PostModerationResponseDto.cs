namespace CAR.Application.Dtos.Moderation
{
    public class PostModerationResponseDto
    {
        public int PostId { get; set; }
        public short Status { get; set; }
        public string Message { get; set; } = null!;
    }
}
