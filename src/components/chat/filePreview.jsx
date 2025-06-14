// components/FilePreview.jsx
import React, { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

const FilePreview = ({ file }) => {
  const [pdfPageCount, setPdfPageCount] = useState(1);
  const [excelData, setExcelData] = useState([]);
  const [docxHtml, setDocxHtml] = useState(null);  
  const [text, setText] = useState(null);
 
  if(file===undefined){
  return
  }
  const fileType = file.name.split(".").pop()?.toLowerCase();

  console.log(fileType);
  
  useEffect(() => {
    if (fileType === "xlsx" || fileType === "csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setExcelData(json);
      };
      reader.readAsArrayBuffer(file);
    } else if (fileType === "docx") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = await mammoth.convertToHtml({
          arrayBuffer: e.target.result,
        });
        setDocxHtml(result.value);
      };
      reader.readAsArrayBuffer(file);
    } else if (fileType === "txt") {
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target.result);
      reader.readAsText(file);
    }
  }, [file, fileType]);

  if (fileType?.startsWith("image")) {
    return <img src={URL.createObjectURL(file)} alt="preview" className="max-w-full max-h-96" />;
  }

  if (fileType === "svg") {
    return <img src={URL.createObjectURL(file)} alt="svg preview" className="max-w-full max-h-96" />;
  }

  if (fileType === "pdf") {
    return (
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setPdfPageCount(numPages)}
      >
        {Array.from(new Array(pdfPageCount), (_, i) => (
          <Page key={i + 1} pageNumber={i + 1} />
        ))}
      </Document>
    );
  }

  if (fileType === "xlsx" || fileType === "csv") {
    return (
      <table className="table-auto border border-collapse">
        <thead>
          <tr>
            {excelData[0] &&
              Object.keys(excelData[0]).map((key) => (
                <th key={key} className="border px-2 py-1 bg-gray-100">
                  {key}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {excelData.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((cell, j) => (
                <td key={j} className="border px-2 py-1">
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (fileType === "docx" && docxHtml) {
    return <div dangerouslySetInnerHTML={{ __html: docxHtml }} />;
  }

  if (fileType === "txt" && text) {
    return <pre className="whitespace-pre-wrap">{text}</pre>;
  }

  return <p className="text-gray-500">Preview not supported for this file type.</p>;
};

export default FilePreview;
