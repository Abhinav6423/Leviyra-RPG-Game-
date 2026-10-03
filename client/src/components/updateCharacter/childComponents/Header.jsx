import React from "react";

const Header = ({ status, handleChange }) => {
  const isPublished = status === "published";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl sm:text-6xl font-black uppercase leading-none tracking-tight">
          <span className="text-white">Update</span>
          <br />
          <span className="text-zinc-500">Character</span>
        </h1>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold ${
            isPublished
              ? "border-[#00e676]/40 bg-[#00e676]/10 text-[#00e676]"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isPublished ? "bg-[#00e676]" : "bg-amber-400"}`}
          />
          {isPublished ? "Published" : "Draft"}
        </span>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
        <label
          htmlFor="status"
          className="text-xs font-semibold text-zinc-400 sm:flex-1"
        >
          Publishing status
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={handleChange}
          className="w-full sm:w-56 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-white outline-none focus:border-[#00e676]/60"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
    </div>
  );
};

export default Header;
