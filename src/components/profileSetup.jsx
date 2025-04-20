import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuthStore } from "@/store/useAuthStore";

const profileSchema = yup.object().shape({
  username: yup.string().required("Username is required").min(3, "Minimum 3 characters"),
  bio: yup.string().max(150, "Bio cannot exceed 150 characters"),
  profileImage: yup.mixed().test("fileSize", "Image must be less than 2MB", (file) => {
    if (!file || file.length === 0) return true; // File is optional
    return file[0]?.size <= 2 * 1024 * 1024; // 2MB limit
  }),
});

const ProfileSetup = ({ setShowProfile }) => {
      const {
        logedInUser
      } = useAuthStore();
  const [previewImage, setPreviewImage] = useState(logedInUser?.photoURL || "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      username: logedInUser?.username || "",
      bio: logedInUser?.bio || "",
    },
  });

  const onSubmit = (data) => {
    console.log("Updated Profile Data:", data);
    // Handle API call for profile update

    setShowProfile(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setValue("profileImage", e.target.files);
    }
  };


  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Profile Image Upload */}
        <div style={styles.formGroup}>
          {previewImage && <img src={previewImage} alt="Profile Preview" style={styles.imagePreview} />}
          <input type="file" accept="image/*" {...register("profileImage")} onChange={handleImageChange} />
          {errors.profileImage && <p style={styles.errorText}>{errors.profileImage.message}</p>}
        </div>

        {/* Username Field */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Username</label>
          <input type="text" {...register("username")} style={styles.input} />
          {errors.username && <p style={styles.errorText}>{errors.username.message}</p>}
        </div>

        {/* Bio Field */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Bio</label>
          <input type="text" {...register("bio")} style={styles.input} />
          {errors.bio && <p style={styles.errorText}>{errors.bio.message}</p>}
        </div>

        {/* Submit Button */}
        <button type="submit" style={styles.button}>
          Update Profile
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#1F1F1F",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    textAlign: "center",
  },

  formGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#fff",
  },
  input: {
    width: "95%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
  },
  errorText: {
    color: "red",
    fontSize: "12px",
  },
  imagePreview: {
    width: "100px",
    height: "100px",
    borderRadius: "50%", // Makes the image round
    objectFit: "cover",
    display: "block",
    margin: "10px auto",
  },
};

export default ProfileSetup;
