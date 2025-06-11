import { useEffect, useState } from "react";
import { FaGithub, FaLink, FaUserFriends, FaMapMarkerAlt, FaBuilding, FaTwitter, FaExclamationCircle, FaCalendarAlt, FaCode, FaEye, FaStar } from "react-icons/fa";

function GitHub() {
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(import.meta.env.VITE_GITHUB_URL);
        
        if (!response.ok) {
          throw new Error(`GitHub API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setApiData(data);
      } catch (err) {
        console.error("Error fetching GitHub data:", err);
        setError(err.message || "Failed to fetch GitHub profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Render loading state with enhanced animation
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <FaGithub className="absolute inset-0 m-auto text-orange-400 text-2xl animate-pulse" />
        </div>
        <h2 className="text-xl font-medium mt-6 animate-pulse">Loading GitHub profile...</h2>
        <div className="flex space-x-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-2 h-2 bg-orange-400 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 max-w-md text-center backdrop-blur-sm">
          <FaExclamationCircle className="text-red-400 text-5xl mb-4 mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold mb-3 text-red-300">Oops! Something went wrong</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If no data was retrieved
  if (!apiData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center">
        <FaExclamationCircle className="text-yellow-500 text-4xl mb-4" />
        <h2 className="text-xl font-medium">No GitHub profile data available</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-10 px-4 mt-14">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <FaGithub className="text-orange-400 text-5xl animate-pulse" />
              <div className="absolute -inset-2 bg-orange-400/20 rounded-full blur-lg"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent mb-3">
            GitHub Profile
          </h1>
          <p className="text-gray-400 text-lg">Discover the developer behind the code</p>
        </header>

        {/* Enhanced User Profile Card */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden mb-12 border border-gray-600/30">
          {/* Profile Header with Glassmorphism */}
          <div className="p-8 md:p-10 md:flex md:items-start relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent"></div>
            <div className="relative flex-shrink-0 flex justify-center md:justify-start mb-8 md:mb-0 md:mr-10">
              <div className="relative group">
                <img
                  src={apiData.avatar_url}
                  alt={`${apiData.login}'s avatar`}
                  className="w-40 h-40 rounded-full border-4 border-orange-500 shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full opacity-20 blur-md group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
            </div>
            
            <div className="relative text-center md:text-left flex-1">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-200 to-orange-400 bg-clip-text text-transparent mb-3">
                {apiData.name || apiData.login}
              </h2>
              
              <div className="text-gray-300 text-lg mb-6 flex items-center justify-center md:justify-start">
                <span className="bg-gradient-to-r from-gray-600 to-gray-700 px-4 py-2 rounded-full text-base font-medium border border-gray-500/30">
                  @{apiData.login}
                </span>
              </div>
              
              {apiData.bio && (
                <p className="text-gray-300 mb-6 text-lg leading-relaxed max-w-2xl">{apiData.bio}</p>
              )}
              
              {/* Enhanced Info Tags */}
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start mb-8">
                {apiData.location && (
                  <div className="flex items-center text-gray-300 bg-gray-700/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-gray-600/30">
                    <FaMapMarkerAlt className="mr-2 text-orange-400" />
                    {apiData.location}
                  </div>
                )}
                {apiData.company && (
                  <div className="flex items-center text-gray-300 bg-gray-700/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-gray-600/30">
                    <FaBuilding className="mr-2 text-orange-400" />
                    {apiData.company}
                  </div>
                )}
                {apiData.twitter_username && (
                  <div className="flex items-center text-gray-300 bg-gray-700/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-gray-600/30">
                    <FaTwitter className="mr-2 text-blue-400" />
                    @{apiData.twitter_username}
                  </div>
                )}
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <a
                  href={apiData.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-300 transform hover:scale-105 font-medium shadow-lg hover:shadow-orange-500/25"
                >
                  <FaGithub className="mr-2" />
                  View Profile
                </a>
                {apiData.blog && (
                  <a
                    href={apiData.blog.startsWith('http') ? apiData.blog : `https://${apiData.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-300 transform hover:scale-105 font-medium shadow-lg border border-gray-500/30"
                  >
                    <FaLink className="mr-2" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced Stats with Animation */}
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t border-gray-600/30">
            {[
              { value: apiData.followers, label: "Followers", icon: <FaUserFriends />, color: "text-blue-400" },
              { value: apiData.following, label: "Following", icon: <FaEye />, color: "text-green-400" },
              { value: apiData.public_repos, label: "Repositories", icon: <FaCode />, color: "text-purple-400" },
              { value: apiData.public_gists, label: "Gists", icon: <FaStar />, color: "text-yellow-400" }
            ].map((stat, index) => (
              <div key={index} className="group hover:transform hover:scale-105 transition-all duration-300 p-4 rounded-lg hover:bg-gray-700/30">
                <div className={`${stat.color} text-2xl mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-1">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-600/30 hover:border-orange-500/30 transition-all duration-300">
            <h3 className="text-2xl font-semibold bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent mb-6 flex items-center justify-center">
              <FaCalendarAlt className="mr-3 text-orange-400" />
              Profile Timeline
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30 border border-gray-600/20 hover:bg-gray-600/30 transition-colors duration-300">
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3"><FaCalendarAlt /></span>
                  Joined GitHub
                </div>
                <span className="font-medium text-orange-300">{formatDate(apiData.created_at)}</span>
              </div>
              
              {apiData.hireable && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700/30 border border-gray-600/20 hover:bg-gray-600/30 transition-colors duration-300">
                  <div className="flex items-center text-gray-300">
                    <span className="text-blue-400 mr-3"><FaBuilding /></span>
                    Available for hire
                  </div>
                  <span className="font-medium text-green-400">Yes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default GitHub;