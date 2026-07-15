import React, { useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { IoDownloadOutline } from "react-icons/io5";
import { LuLoaderCircle } from "react-icons/lu";

const Home = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [videoinfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      return alert("please enter a URL");
    }
    
    setLoading(true);
    try{

      const response = await fetch(`${API_URL}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
        }),
      });


      const data = await response.json();
      setVideoInfo(data);
      console.log(data.formats)
    }catch(error){
      console.error(error)
      alert("Something went wrong")
    }finally{
      setLoading(false)
    }
    console.log(url);
  };

  const downloadableFormats = videoinfo?.formats.filter((format)=>{
      // We no longer require acodec !== 'none' because our backend will merge audio!
      const isUpTo1080p = format.height ? format.height <= 1080 : true;
      return format.ext === "mp4" && format.vcodec !== 'none' && isUpTo1080p;
    }) || []

  const handleDownload = async () => {
    if (!selectedFormat) {
      return alert("Please select a format first.");
    }

    setDownloading(true);
    try {
      const response = await fetch(`${API_URL}/download-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
          formatId: selectedFormat,
        }),
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      // Convert the response to a blob and trigger browser download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${videoinfo.title || "video"}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error(error);
      alert("Error downloading the video.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="w-[90%] max-w-6xl mx-auto">

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center items-center">

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight">
              Download directly to your
              <br />
              Phone or PC
            </h1>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-10 w-full max-w-2xl flex sm:flex-row gap-4"
          >
            <input
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="text"
              placeholder="Paste your video URL here"
              className="flex-1 p-4 rounded-lg bg-neutral-900 border border-neutral-700 outline-none"
            />

            <button
              type="submit"
              className="cursor-pointer p-4 rounded-lg bg-neutral-900 border border-neutral-700 active:scale-105 flex justify-center items-center"
            >
              {loading ? (
                <LuLoaderCircle size={22} className="animate-spin" />
              ) : (
                <IoDownloadOutline size={22} />
              )}
            </button>
          </form>

          {/* Video Preview */}
          {videoinfo && (
            <div className="w-full max-w-xl mt-10 bg-neutral-900 border border-neutral-700 rounded-xl p-2">

              <div className="flex flex-col relative">

                {/* Thumbnail */}
                <div className="w-full max-w-xl mx-auto" >
                  <img
                    src={videoinfo.thumbnail}
                    alt={videoinfo.title}
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="mt-6 flex flex-col gap-4 px-2">
                  <select 
                    className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white outline-none w-full appearance-none cursor-pointer"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                  >
                    <option value="" disabled>Select Format & Quality</option>
                    {downloadableFormats.map((format) => (
                      <option key={format.format_id} value={format.format_id}>
                        {format.resolution || format.format_note || 'Unknown'} - {format.ext} {format.vcodec !== 'none' ? '(Video)' : '(Audio)'}
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={handleDownload}
                    disabled={downloading}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex justify-center items-center h-12"
                  >
                    {downloading ? (
                      <div className="flex items-center gap-2">
                        <LuLoaderCircle size={22} className="animate-spin" />
                        <span>Downloading...</span>
                      </div>
                    ) : (
                      "Download Selected"
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

        </section>

      </div>
    </div>
  );
};

export default Home;