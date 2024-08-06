import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { getInitials } from "../utils";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [editMode, setEditMode] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setValue("name", "Avaya");
      setValue("email", "avaya.sharma933@gmail.com");
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:5000/api/user/update", {
        userId: user._id,
        ...data,
      });
      console.log(response.data);
      if (response.data.success) {
        alert("Profile updated successfully!");
        setEditMode(false);
        // Update the user in the Redux store if necessary
      }
    } catch (error) {
      console.log(error);
      alert("Error updating profile.");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#f3f4f6]">
      <div className="w-full md:max-w-2xl p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-blue-700">Profile</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">
          <Textbox
            placeholder="Name"
            type="text"
            name="name"
            label="Name"
            className="w-full rounded-full"
            register={register("name", { required: "Name is required!" })}
            error={errors.name ? errors.name.message : ""}
            disabled={!editMode}
          />

          <Textbox
            placeholder="email@example.com"
            type="email"
            name="email"
            label="Email Address"
            className="w-full rounded-full"
            register={register("email", { required: "Email Address is required!" })}
            error={errors.email ? errors.email.message : ""}
            disabled={!editMode}
          />

          {editMode && (
            <Button
              type="submit"
              label="Save Changes"
              className="w-full h-10 bg-blue-700 text-white rounded-full"
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
