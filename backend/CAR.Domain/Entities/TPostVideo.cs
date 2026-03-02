using System;

namespace CAR.Domain.Entities
{
    public class TPostVideo
    {
        public int Id { get; set; }

        public int PostId { get; set; }

        public string VideoUrl { get; set; } = null!;

        public DateTime CreatedAt { get; set; }
    }
}
