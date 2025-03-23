import React, { useState, useEffect, ChangeEvent } from 'react';
import {
    createColumnHelper,
} from "@tanstack/react-table";

type Option = {
    label: string;
    value: string;
};

const TableCell = ({ getValue, row, column, table }) => {
    const initialValue = getValue()
    const columnMeta = column.columnDef.meta
    const tableMeta = table.options.meta
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    const onBlur = () => {
        tableMeta?.updateData(row.index, column.id, value)
    }

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setValue(e.target.value)
        tableMeta?.updateData(row.index, column.id, e.target.value)
    }

    if (tableMeta?.editedRows[row.id]) {
        return columnMeta?.type === "select" ? (
            <select onChange={onSelectChange} value={initialValue}>
                {columnMeta?.options?.map((option: Option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        ) : (
            <input
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
                type={columnMeta?.type || "text"}
            />
        )
    }
    return <span>{value}</span>
}

const EditCell = ({ row, table }) => {
    const meta = table.options.meta;

    const setEditedRows = (e) => {
        const elName = e.currentTarget.name;
        meta?.setEditedRows((old: []) => ({
            ...old,
            [row.id]: !old[row.id],
        }));
        if (elName !== "edit") {
            meta?.revertData(row.index, e.currentTarget.name === "cancel");
        }
    };

    return (
        <div className="edit-cell-container">
            {meta?.editedRows[row.id] ? (
                <div className="edit-cell">
                    <button onClick={setEditedRows} name="cancel">
                        X
                    </button>
                    <button onClick={setEditedRows} name="done">
                        ✔
                    </button>
                </div>
            ) : (
                <button onClick={setEditedRows} name="edit">
                    ✐
                </button>
            )}
        </div>
    );
};
type rowVals = {
    studentId: string;
    state: string;
    country: string;
    gender: string;
    ethnicity: string;
    originSource: string;
    studentType: string;
    major: string;
    financialAidOfferedAmount: number;
    athlete: string;
    sport: string;
    raleyCollegeTagExists: string;
    recruitingTerritory: string;
    counselor: string;
    counselorIncomingTextCount: number;
    counselorOutgoingTextCount: number;
    phoneSuccessfulCount: number;
    phoneUnsuccessfulCount: number;
    phoneVoicemailCount: number;
    admittedStudentsDay: string;
    bisonDay: string;
    bisonDayAtTheWeekend: string;
    campusVisit: string;
    dallasBisonExclusive: string;
    footballVisit: string;
    golfVisit: string;
    oklahomaCityBisonExclusive: string;
    scholarsBisonDay: string;
    scholarsMixerAndBanquet: string;
    scholarshipInterview: string;
    scholarshipInterviewRegistration: string;
    softballVisit: string;
    trackVisit: string;
    tulsaBisonExclusive: string;
    volleyballVisit: string;
    eventsAttendedCount: number;
    prediction: string;
}
export default rowVals;

const columnHelper = createColumnHelper<rowVals>();

export const columns = [
    columnHelper.accessor("studentId", {
        header: "Student ID",
    }),
    columnHelper.accessor("state", {
        header: "State",
        cell: TableCell,
    }),
    columnHelper.accessor("country", {
        header: "Country",
        cell: TableCell,
    }),
    columnHelper.accessor("gender", {
        header: "Gender",
        cell: TableCell,
    }),
    columnHelper.accessor("ethnicity", {
        header: "Ethnicity",
        cell: TableCell,
    }),
    columnHelper.accessor("originSource", {
        header: "Origin Source",
        cell: TableCell,
    }),
    columnHelper.accessor("studentType", {
        header: "Student Type",
        cell: TableCell,
    }),
    columnHelper.accessor("major", {
        header: "Major",
        cell: TableCell,
    }),
    columnHelper.accessor("financialAidOfferedAmount", {
        header: "Financial Aid Offered",
        cell: TableCell,
    }),
    columnHelper.accessor("athlete", {
        header: "Athlete",
        cell: TableCell,
    }),
    columnHelper.accessor("sport", {
        header: "Sport",
        cell: TableCell,
    }),
    columnHelper.accessor("raleyCollegeTagExists", {
        header: "Raley College Tag Exists",
        cell: TableCell,
    }),
    columnHelper.accessor("recruitingTerritory", {
        header: "Recruiting Territory",
        cell: TableCell,
    }),
    columnHelper.accessor("counselor", {
        header: "Counselor",
        cell: TableCell,
    }),
    columnHelper.accessor("counselorIncomingTextCount", {
        header: "Counselor Incoming Text Count",
        cell: TableCell,
    }),
    columnHelper.accessor("counselorOutgoingTextCount", {
        header: "Counselor Outgoing Text Count",
        cell: TableCell,
    }),
    columnHelper.accessor("phoneSuccessfulCount", {
        header: "Phone Successful Count",
        cell: TableCell,
    }),
    columnHelper.accessor("phoneUnsuccessfulCount", {
        header: "Phone Unsuccessful Count",
        cell: TableCell,
    }),
    columnHelper.accessor("phoneVoicemailCount", {
        header: "Phone Voicemail Count",
        cell: TableCell,
    }),
    columnHelper.accessor("admittedStudentsDay", {
        header: "Admitted Students Day",
        cell: TableCell,
    }),
    columnHelper.accessor("bisonDay", {
        header: "Bison Day",
        cell: TableCell,
    }),
    columnHelper.accessor("bisonDayAtTheWeekend", {
        header: "Bison Day At The Weekend",
        cell: TableCell,
    }),
    columnHelper.accessor("campusVisit", {
        header: "Campus Visit",
        cell: TableCell,
    }),
    columnHelper.accessor("dallasBisonExclusive", {
        header: "Dallas Bison Exclusive",
        cell: TableCell,
    }),
    columnHelper.accessor("footballVisit", {
        header: "Football Visit",
        cell: TableCell,
    }),
    columnHelper.accessor("golfVisit", {
        header: "Golf Visit",
        cell: TableCell,
    }),
    columnHelper.accessor("oklahomaCityBisonExclusive", {
        header: "OKC Bison Exclusive",
        cell: TableCell,
    }),
    columnHelper.accessor("scholarsBisonDay", {
        header: "Scholars Bison Day",
        cell: TableCell,
    }),
    columnHelper.accessor("scholarsMixerAndBanquet", {
        header: "Scholars Mixer and Banquet",
        cell: TableCell,
    }),
    columnHelper.accessor("scholarshipInterview", {
        header: "Scholarship Interview",
        cell: TableCell,
    }),
    columnHelper.accessor("scholarshipInterviewRegistration", {
        header: "Scholarship Interview Registration",
        cell: TableCell,
    }),
    columnHelper.accessor("softballVisit", {
        header: "SoftballVisit",
        cell: TableCell,
    }),
    columnHelper.accessor("trackVisit", {
        header: "Track Visit",
        cell: TableCell,
    }),
    columnHelper.accessor("tulsaBisonExclusive", {
        header: "Tulsa Bison Exclusive",
        cell: TableCell,
    }),
    columnHelper.accessor("volleyballVisit", {
        header: "Volleyball Visit",
        cell: TableCell,
    }),
    columnHelper.accessor("eventsAttendedCount", {
        header: "Events Attended Count",
        cell: TableCell,
    }),
    columnHelper.accessor("prediction", {
        header: "Prediction",
    }),
    columnHelper.display({
        id: "edit",
        cell: EditCell,
    }),
];

