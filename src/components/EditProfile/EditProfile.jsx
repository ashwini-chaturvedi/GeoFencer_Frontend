import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { updateUserProfile } from "../../Features/Slices/authSlice";

const EditProfile = () => {
  const { user, token, loading, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    phoneNo: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNo: user.phoneNo || "",
        userName: user.userName || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Updating profile with data:", formData);
      const response = await fetch(`${backendUrl}/admin/${user?.emailId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      // Create updated user object that preserves emailId and other properties
      const updatedUserData = {
        ...user,
        ...formData
      };
      
      // Use the dedicated updateUserProfile action instead of loginSuccess
      dispatch(updateUserProfile(updatedUserData));
      
      setProfileUpdated(true);
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 px-4 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Enhanced header with gradient animation */}
        <motion.div 
          className="h-28 bg-gradient-to-r from-blue-400 to-yellow-200 relative overflow-hidden"
          initial={{ backgroundPosition: "0% 50%" }}
          animate={{ backgroundPosition: "100% 50%" }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            repeatType: "reverse", 
            ease: "linear" 
          }}
        >
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="absolute bottom-6 left-6">
            <h1 className="text-3xl font-bold text-black drop-shadow-md">Edit Profile</h1>
          </div>
        </motion.div>

        <div className="px-8 py-10">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">

              {/* FullName */}
              <div className="transition-all duration-200 hover:scale-[1.01]">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                  placeholder="Your New full name"
                />
              </div>

              {/* Phone No */}
              <div className="transition-all duration-200 hover:scale-[1.01]">
                <label
                  htmlFor="phoneNo"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNo"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                  placeholder="Your New phone number"
                />
              </div>

              {/* UserName */}
              <div className="transition-all duration-200 hover:scale-[1.01]">
                <label
                  htmlFor="userName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  UserName
                </label>
                <input
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}                  
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm"
                  placeholder="Your New UserName"
                ></input>
              </div>

              {/* Email (read-only) */}
              <div className="transition-all duration-200 hover:scale-[1.01]">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email (cannot be changed)
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.emailId || ""}
                  placeholder={isAuthenticated ? user?.emailId : "abcd1234@gmail.com"}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm text-gray-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-6 mt-6 border-t border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting || profileUpdated}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-400 to-yellow-200 hover:from-yellow-200 hover:to-blue-400 text-black font-medium rounded-lg transition-all duration-300 flex items-center justify-center shadow-md ${
                    (isSubmitting || profileUpdated) && "opacity-70 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white mr-3"></div>
                      Saving...
                    </div>
                  ) : profileUpdated ? (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Profile Updated!
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditProfile;