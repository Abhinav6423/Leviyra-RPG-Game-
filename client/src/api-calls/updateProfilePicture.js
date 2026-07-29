// NOTE: adjust this import to whatever axios instance / base client your
// other api-calls files use (the same one updateBannerImage.js uses).
import api from "../lib/axios.js";

// Hits PUT /profile/update-profile-picture with the image as multipart
// form-data (backend expects the field name "profilePicture", see
// upload.single("profilePicture") in profile.routes.js).
//
// NOTE: adjust "/profile/update-profile-picture" if your router is
// mounted under a different prefix (e.g. "/api/profile/...").
export const updateProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append("profilePicture", file);

  const { data } = await api.put(
    "/profile/update-profile-picture",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  console.log("updateProfilePicture response:", data);
  return data;
};