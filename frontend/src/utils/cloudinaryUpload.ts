async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video",
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "evCarRentalSystem");
  formData.append("cloud_name", "dfuox6suy");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dfuox6suy/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    throw new Error("Không thể tải lên. Vui lòng thử lại.");
  }

  const data = await res.json();

  if (!data.secure_url) {
    throw new Error("Phản hồi từ Cloudinary không hợp lệ.");
  }

  return data.secure_url as string;
}

export async function uploadImage(file: File): Promise<string> {
  return uploadToCloudinary(file, "image");
}

export async function uploadVideo(file: File): Promise<string> {
  return uploadToCloudinary(file, "video");
}
