import { useEffect, useState } from "react";
import { FaGithub, FaLink, FaUserFriends, FaMapMarkerAlt, FaBuilding, FaTwitter, FaExclamationCircle, FaSpinner } from "react-icons/fa";

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

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center">
        <FaSpinner className="animate-spin text-orange-400 text-4xl mb-4" />
        <h2 className="text-xl font-medium">Loading GitHub profile...</h2>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center p-4">
        <FaExclamationCircle className="text-red-500 text-4xl mb-4" />
        <h2 className="text-xl font-bold mb-2">Unable to load GitHub profile</h2>
        <p className="text-gray-300 text-center max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If no data was retrieved
  if (!apiData) {
    return (
      <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center">
        <FaExclamationCircle className="text-yellow-500 text-4xl mb-4" />
        <h2 className="text-xl font-medium">No GitHub profile data available</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white py-10 px-4 mt-14">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-center mb-8">
          <FaGithub className="text-orange-400 text-4xl mr-4" />
          <h1 className="text-4xl font-bold text-center text-orange-400">GitHub Profile</h1>
        </header>

        {/* User Profile Card */}
        <div className="bg-gray-700 rounded-lg shadow-xl overflow-hidden mb-10">
          {/* Profile Header */}
          <div className="p-6 md:p-8 md:flex md:items-start">
            <div className="flex-shrink-0 flex justify-center md:justify-start mb-6 md:mb-0 md:mr-8">
              <img
                src={apiData.avatar_url}
                alt={`${apiData.login}'s avatar`}
                className="w-36 h-36 rounded-full border-4 border-orange-500 shadow-lg object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold text-orange-300 mb-2">{apiData.name || apiData.login}</h2>
              
              <div className="text-gray-300 text-xl mb-4 flex items-center justify-center md:justify-start">
                <span className="bg-gray-600 px-3 py-1 rounded-full text-base">@{apiData.login}</span>
              </div>
              
              <p className="text-gray-300 mb-4">{apiData.bio}</p>
              
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                {apiData.location && (
                  <div className="flex items-center text-gray-300">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    {apiData.location}
                  </div>
                )}
                {apiData.company && (
                  <div className="flex items-center text-gray-300">
                    <FaBuilding className="mr-2 text-gray-400" />
                    {apiData.company}
                  </div>
                )}
                {apiData.twitter_username && (
                  <div className="flex items-center text-gray-300">
                    <FaTwitter className="mr-2 text-gray-400" />
                    @{apiData.twitter_username}
                  </div>
                )}
              </div>
              
              <div className="flex mt-4 gap-3 justify-center md:justify-start">
                <a
                  href={apiData.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full flex items-center transition-colors"
                >
                  <FaGithub className="mr-2" />
                  View Profile
                </a>
                {apiData.blog && (
                  <a
                    href={apiData.blog.startsWith('http') ? apiData.blog : `https://${apiData.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-full flex items-center transition-colors"
                  >
                    <FaLink className="mr-2" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="bg-gray-800 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-gray-600">
            <div className="py-2">
              <div className="text-2xl font-bold text-orange-400">{apiData.followers.toLocaleString()}</div>
              <div className="text-gray-400">Followers</div>
            </div>
            <div className="py-2">
              <div className="text-2xl font-bold text-orange-400">{apiData.following.toLocaleString()}</div>
              <div className="text-gray-400">Following</div>
            </div>
            <div className="py-2">
              <div className="text-2xl font-bold text-orange-400">{apiData.public_repos.toLocaleString()}</div>
              <div className="text-gray-400">Repositories</div>
            </div>
            <div className="py-2">
              <div className="text-2xl font-bold text-orange-400">{apiData.public_gists.toLocaleString()}</div>
              <div className="text-gray-400">Gists</div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-700 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center">
              <FaUserFriends className="mr-2" />
              Profile Information
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between pb-2 border-b border-gray-600">
                <span className="text-gray-300">Created on</span>
                <span className="font-medium text-orange-300">{formatDate(apiData.created_at)}</span>
              </li>
              <li className="flex justify-between pb-2 border-b border-gray-600">
                <span className="text-gray-300">Last updated</span>
                <span className="font-medium text-orange-300">{formatDate(apiData.updated_at)}</span>
              </li>
              <li className="flex justify-between pb-2 border-b border-gray-600">
                <span className="text-gray-300">Type</span>
                <span className="font-medium text-orange-300">{apiData.type}</span>
              </li>
              <li className="flex justify-between pb-2 border-b border-gray-600">
                <span className="text-gray-300">Hireable</span>
                <span className="font-medium text-orange-300">{apiData.hireable ? "Yes" : "No specified"}</span>
              </li>
              {apiData.email && (
                <li className="flex justify-between pb-2 border-b border-gray-600">
                  <span className="text-gray-300">Email</span>
                  <span className="font-medium text-orange-300">{apiData.email}</span>
                </li>
              )}
            </ul>
          </div>
          
          <div className="bg-gray-700 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-orange-400 mb-4">API Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between pb-2 border-b border-gray-600">
                <span className="text-gray-300">API URL</span>
                <a 
                  href={apiData.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-400 hover:underline truncate max-w-xs"
                >
                  {apiData.url}
                </a>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-600">
                <span className="text-gray-300">Followers URL</span>
                <a 
                  href={apiData.followers_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-400 hover:underline truncate max-w-xs"
                >
                  View Followers
                </a>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-600">
                <span className="text-gray-300">Repos URL</span>
                <a 
                  href={apiData.repos_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-400 hover:underline truncate max-w-xs"
                >
                  View Repositories
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced: Raw JSON data (Collapsible) */}
        <details className="bg-gray-700 rounded-lg shadow-md overflow-hidden mb-8">
          <summary className="bg-gray-600 p-4 text-orange-400 font-semibold cursor-pointer text-lg hover:bg-gray-500 transition-colors">
            View Raw API Response
          </summary>
          <div className="p-4 overflow-x-auto">
            <pre className="text-xs text-gray-300 bg-gray-800 p-4 rounded">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}

export default GitHub;