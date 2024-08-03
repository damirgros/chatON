import React, { useState, useEffect } from "react";
import axios from "axios";
import { ProfileProps } from "../types/types";
import gravatar from "gravatar";
import { useNavigate } from "react-router-dom";

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState<string>(user.bio || "");
  const [location, setLocation] = useState<string>(user.location || "");
  const [profilePicture, setProfilePicture] = useState<string>(
    user.profilePicture || gravatar.url(user.email, { s: "200", d: "retro" }, true)
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/user/${user.id}`);
        const updatedUser = response.data.user;

        setBio(updatedUser.bio || "");
        setLocation(updatedUser.location || "");
        setProfilePicture(
          updatedUser.profilePicture || gravatar.url(user.email, { s: "200", d: "retro" }, true)
        );
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user.id, user.email]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("location", location);
    if (selectedFile) {
      formData.append("profilePicture", selectedFile);
    }

    try {
      const response = await axios.put(`/api/user/${user.id}/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.user;
      setBio(updatedUser.bio);
      setLocation(updatedUser.location);
      setProfilePicture(
        updatedUser.profilePicture || gravatar.url(user.email, { s: "200", d: "retro" }, true)
      );
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setProfilePicture(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`/api/user/${user.id}`);
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div className="profile">
      <h2>Profile</h2>
      <img
        src={
          profilePicture.startsWith("http")
            ? profilePicture
            : `http://localhost:5000${profilePicture}`
        }
        alt="Profile Picture"
        onError={(e) => {
          console.error(`Error loading image: ${profilePicture}`, e);
          e.currentTarget.src = gravatar.url(user.email, { s: "200", d: "retro" }, true); // Fallback to gravatar
        }}
      />
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
      {editMode ? (
        <div>
          <label>
            Bio:
            <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>
          <label>
            Location:
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
          <label>
            Profile Picture:
            <input type="file" accept="image/*" name="profilePicture" onChange={handleFileChange} />
          </label>
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div>
          <p>Bio: {bio || "No bio available"}</p>
          <p>Location: {location || "No location available"}</p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}
      <button onClick={handleDeleteAccount} style={{ color: "red" }}>
        Delete Account
      </button>
    </div>
  );
};

export default Profile;
