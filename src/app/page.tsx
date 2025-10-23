"use client";

import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { useDebouncedValue } from "./hooks/useDebouncedValue";

interface ElProps {
  children: ReactNode;
  className?: string;
}

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6)
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
};

interface AdvocateRecord {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt: string;
}

export default function Home() {
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(userSearchTerm, 400);
  const [advocates, setAdvocates] = useState<AdvocateRecord[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<AdvocateRecord[]>(
    [],
  );

  useEffect(() => {
    console.log("Fetching initial advocates");
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      });
    });
  }, []);

  useEffect(() => {
    console.log("Searching for", { debouncedSearchTerm });
    fetch(`/api/advocates?q=${encodeURIComponent(debouncedSearchTerm)}`).then(
      (response) => {
        response.json().then((jsonResponse) => {
          setAdvocates(jsonResponse.data);
          setFilteredAdvocates(jsonResponse.data);
        });
      },
    );
  }, [debouncedSearchTerm]);

  const onChangeUserSearchTerm = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setUserSearchTerm(searchTerm);
  };

  const resetSearch = () => {
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      });
    });
    setUserSearchTerm("");
    setFilteredAdvocates(advocates);
  };

  const TH = ({ children, className = "" }: ElProps) => (
    <th
      className={`bg-emerald-800 text-white text-center px-2 py-2 text-left whitespace-normal break-words w-48 ${className}`}
    >
      {children}
    </th>
  );

  const TD = ({ children, className = "" }: ElProps) => (
    <td className={`px-2 py-2 text-xs text-center lg:text-sm ${className}`}>
      {children}
    </td>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-auto">
      <h1 className="text-xl text-bold">Solace Advocate Search</h1>
      <br />
      <br />
      <div className="space-y-2 py-4">
        <div>
          <p className="text-sm">
            Searching for:{" "}
            <span id="search-term" className="text-emerald-700">
              {userSearchTerm}
            </span>{" "}
            <br />
            <span className="text-xs text-emerald-700">
              Showing {advocates.length} Providers
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            onChange={onChangeUserSearchTerm}
            value={userSearchTerm}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 w-64 text-sm transition"
            placeholder="Search for a provider..."
          />
          <button
            className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md shadow transition"
            onClick={resetSearch}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm border-collapse">
          <thead className="text-left text-xs sm:text-sm">
            <tr>
              <TH>First Name</TH>
              <TH>Last Name</TH>
              <TH>City</TH>
              <TH>Degree</TH>
              <TH>Specialties</TH>
              <TH>Years of Experience</TH>
              <TH>Phone Number</TH>
            </tr>
          </thead>
          <tbody>
            {filteredAdvocates.map((advocate) => {
              return (
                <tr
                  className="odd:bg-emerald-50 even:bg-emerald-100"
                  key={advocate.id}
                >
                  <TD>{advocate.firstName}</TD>
                  <TD>{advocate.lastName}</TD>
                  <TD>{advocate.city}</TD>
                  <TD>{advocate.degree}</TD>
                  <TD>
                    <ul>
                      {advocate.specialties.map((s) => (
                        <li className="text-xs text-left list-disc" key={s}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </TD>
                  <TD>{advocate.yearsOfExperience}</TD>
                  <TD className="whitespace-nowrap">
                    {formatPhone(advocate.phoneNumber.toString())}
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
