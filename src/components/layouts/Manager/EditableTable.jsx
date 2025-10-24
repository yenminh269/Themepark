import React from "react";

const EditableTable = ({ data, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-3xl border border-[#DDE5D9] bg-white/70 shadow-md backdrop-blur-md max-w-[1400px] mx-auto w-full">
      <table className="w-full border-collapse text-left">
        <thead className="bg-[#CFE3D3]/40">
          <tr>
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key} className="px-6 py-4 text-sm font-semibold uppercase tracking-wide text-[#2F4F4F]">
                {key}
              </th>
            ))}
            <th className="px-6 py-4 text-sm font-semibold text-[#2F4F4F]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t border-[#DDE5D9] hover:bg-[#F8FAF8] transition">
              {Object.values(row).map((val, i) => (
                <td key={i} className="px-6 py-4 text-sm text-[#384B3A]">{val}</td>
              ))}
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(row)}
                    className="rounded-md bg-[#8FB996] px-3 py-1 text-sm font-semibold text-white hover:bg-[#2F4F4F] transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(row.id)}
                    className="rounded-md bg-red-500 px-3 py-1 text-sm font-semibold text-white hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditableTable;
