import useSendFile from "@/hooks/useSendFileToGoogleDrive";
import { useAuthStore } from "@/store/useAuthStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { db } from "../firebase";
import LoadingSpinner from "./loadingSpinner";

const profileSchema = yup.object().shape({
  username: yup.string().min(3, "Minimum 3 characters").nullable(),
  bio: yup.string().max(150, "Bio cannot exceed 150 characters").nullable(),
  profileImage: yup
    .mixed()
    .test("fileSize", "Image must be less than 2MB", (file) => {
      if (!file || file.length === 0) return true;
      return file[0]?.size <= 2 * 1024 * 1024;
    }),
});

const ProfileSetup = ({ setShowProfile }) => {
  const { logedInUser } = useAuthStore();
  const [isLoading,setisloading]=useState(false);

  const [previewImage, setPreviewImage] = useState(
    logedInUser.storeData.photoURL || ""
  );
  
  const { setFile, sendFile } = useSendFile();
  const inputRef = useRef(null);

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

  useEffect(() => {
    setValue("username", logedInUser.storeData.username);
    setValue("bio", logedInUser.storeData.bio);
  }, [logedInUser]);

  const onSubmit = async (data) => {
    setisloading(true);
    let updatedFields = {};

    if (data.username) {
      updatedFields.username = data.username;
    }

    if (data.bio) {
      updatedFields.bio = data.bio;
    }

    if (data.profileImage && data.profileImage.length > 0) {
      const photoURL = await sendFile();
      if (!photoURL) return;
      updatedFields.photoURL = photoURL;
    }

    if (Object.keys(updatedFields).length > 0) {
      await setDoc(doc(db, "users", logedInUser.uid), updatedFields, {
        merge: true,
      });
    }
    setisloading(false);
    setShowProfile(false);
  };

  const handleImageClick = () => {
    inputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setValue("profileImage", e.target.files);
      setFile(file);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={styles.formGroup}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <div
              onClick={handleImageClick}
              style={{ cursor: "pointer", width: "fit-content" }}
            >
              <img
                src={previewImage}
                alt="Profile Preview"
                style={styles.imagePreview}
              />
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            {...register("profileImage")}
            onChange={handleImageChange}
            ref={inputRef}
            style={{ display: "none" }} // hidden input
          />
          {errors.profileImage && (
            <p style={styles.errorText}>{errors.profileImage.message}</p>
          )}
        </div>
        {/* Username Field */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Username</label>
          <input type="text" {...register("username")} style={styles.input} />
          {errors.username && (
            <p style={styles.errorText}>{errors.username.message}</p>
          )}
        </div>

        {/* Bio Field */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Bio</label>
          <input type="text" {...register("bio")} style={styles.input} />
          {errors.bio && <p style={styles.errorText}>{errors.bio.message}</p>}
        </div>

        {/* Submit Button */}
        <button type="submit" style={styles.button}>
        {isLoading ? <LoadingSpinner/> :'Update Profile' }  
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
    backgroundColor: "#1f6f4c",
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
