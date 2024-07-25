"use client";
import axiosInstance from "@/helper/axiosInstance";
import { useState, useEffect } from "react";
type Data = {
  id: number;
  title: string;
  nominal: number;
  type: string;
  category: string;
  date: string;
};
export default function Home() {
  const [expense, setExpense] = useState<Data[]>([]);

  /// ADD DATA
  const [type, setType] = useState<string>("income");
  const [title, setTitle] = useState<string>("");
  const [nominal, setNominal] = useState<number>(0);
  const [category, setCategory] = useState<string>("salary");

  ///SEARCH WITH CATEGORY
  const [priceCategory, setPriceCategory] = useState<string>("all");

  ///SEARCH WITH DATE AND CATEGORY
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filterDateTotal, setFilterDateTotal] = useState<number>(0);
  const [filterData, setFilterData] = useState<Data[]>([]);
  const [incomeDate, setIncomeDate] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState<number>(0);

  const getData = async () => {
    try {
      const { data } = await axiosInstance.get("/tracker");
      setExpense(data);
    } catch (error) {
      console.log(error);
    }
  };

  const addData = async () => {
    try {
      await axiosInstance.post("/tracker/add", {
        title: title,
        nominal: nominal,
        type: type,
        category: category,
      });

      setTitle("");
      setNominal(0);
      setType("income");
      setCategory("salary");
    } catch (error) {
      console.log(error);
    }
  };

  const filterByDate = async () => {
    try {
      console.log("Start Date:", startDate);
      console.log("End Date:", endDate);

      const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate,
      });

      const { data } = await axiosInstance.get(
        `/tracker/total?${params.toString()}`
      );

      setFilterDateTotal(data.total);

      setFilterData(data.filteredData);
      setIncomeDate(data.income);
      setExpenseDate(data.expense);

      console.log(filterData);
    } catch (error) {
      console.log(error);
    }
  };

  const filterByCategory = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/tracker/totalbycategory?category=${priceCategory}`
      );
      setFilterData(data.filteredData);

      setFilterDateTotal(data.total);
      setIncomeDate(data.income);
      setExpenseDate(data.expense);
      console.log(priceCategory);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, [expense]);

  useEffect(() => {
    if (priceCategory !== "all") {
      filterByCategory();
    }
  }, [priceCategory]);

  const deleteData = async (id: number) => {
    try {
      const { data } = await axiosInstance.delete(`/tracker/delete/${id}`);
      console.log(data);
      if (data.success) {
        setExpense(expense.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteDataAtFilter = async (id: number) => {
    try {
      const { data } = await axiosInstance.delete(`/tracker/delete/${id}`);
      console.log(data);
      if (data.success) {
        setFilterData(filterData.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const showfilterByDate = filterData.map((val: Data) => {
    return (
      <div key={val.id}>
        <div className="w-full h-auto flex justify-between items-center p-5">
          <div className="flex flex-col justify-start">
            <div>
              <p>{val.title}</p>
            </div>
            <div>
              <p>{val.category}</p>
            </div>
          </div>
          <div>
            <p>
              {val.nominal.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </p>
          </div>
          <div>
            <button
              className="bg-violet-300 rounded-xl shadow-xl p-2"
              onClick={() => deleteDataAtFilter(val.id)}
            >
              DELETE
            </button>
          </div>
        </div>
      </div>
    );
  });

  const nominalTypeExpense = expense.filter(
    (val: Data) => val.type === "expense"
  );
  const nominalExpenseList = nominalTypeExpense.map((val: Data) => val.nominal);
  const totalNominalExpense = nominalExpenseList.reduce(
    (acc, cur) => acc + cur,
    0
  );

  const nominalTypeIncome = expense.filter(
    (val: Data) => val.type === "income"
  );
  const nominalIncomeList = nominalTypeIncome.map((val: Data) => val.nominal);
  const totalNominalIncome = nominalIncomeList.reduce(
    (acc, cur) => acc + cur,
    0
  );

  const showExpense = expense.map((val: Data) => {
    return (
      <div key={val.id}>
        <div className="w-full h-auto flex justify-between items-center p-5">
          <div className="flex flex-col justify-start">
            <div>
              <p>{val.title}</p>
            </div>
            <div>
              <p>{val.category}</p>
            </div>
          </div>
          <div>
            <p>
              {val.nominal.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </p>
          </div>
          <div>
            <button
              className="bg-violet-300 rounded-xl shadow-xl p-2"
              onClick={() => deleteData(val.id)}
            >
              DELETE
            </button>
          </div>
        </div>
      </div>
    );
  });

  return (
    <main className="w-full min-h-screen flex justify-center items-center bg-white">
      <div className="flex min-h-[80vh] w-[80%] justify-center items-center gap-10 bg-slate-200 p-10">
        <div className="flex flex-col items-center justify-center w-full h-auto gap-5">
          <div className="w-full h-auto">
            <p className="text-4xl">Hello, track your money</p>
          </div>
          <div className="w-full h-auto shadow-xl flex flex-col justify-center items-center gap-5 p-5 bg-white">
            <div>
              <p className="text-xl text-center">Your Money Balance</p>
              <p className="text-4xl text-center font-bold">
                {filterData.length > 0 ||
                priceCategory === "food" ||
                priceCategory === "salary" ||
                priceCategory === "transport" ||
                (startDate && endDate)
                  ? filterDateTotal.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })
                  : (totalNominalIncome - totalNominalExpense).toLocaleString(
                      "id-ID",
                      { style: "currency", currency: "IDR" }
                    )}
              </p>
            </div>
            <div className="w-full h-auto flex justify-around items-center">
              <div className="flex flex-col justify-center items-center">
                <div>
                  <p>Income</p>
                </div>
                <div>
                  <p className="font-bold">
                    {filterData.length > 0 ||
                    priceCategory === "food" ||
                    priceCategory === "salary" ||
                    priceCategory === "transport" ||
                    (startDate && endDate)
                      ? incomeDate.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })
                      : totalNominalIncome.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center">
                <div>
                  <p>Expense</p>
                </div>
                <div className="font-bold">
                  <p>
                    {filterData.length > 0 ||
                    priceCategory === "food" ||
                    priceCategory === "salary" ||
                    priceCategory === "transport" ||
                    (startDate && endDate)
                      ? expenseDate.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })
                      : totalNominalExpense.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-auto flex flex-col gap-5">
            <form className="w-full h-auto flex justify-between items-center">
              <div>
                <p>Category</p>
              </div>
              <div>
                <select
                  className="w-[15.5rem] h-auto rounded-md p-1 shadow-md"
                  value={priceCategory}
                  onChange={(e) => {
                    setPriceCategory(e.target.value);
                  }}
                >
                  <option value="first">Select Category</option>
                  <option value="salary">Salary</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                </select>
              </div>
            </form>
            <form className="w-full h-auto flex justify-between items-center gap-5">
              <div className="w-1/2 gap-2 h-auto justify-between flex items-center">
                <div className="w-1/2 h-auto">
                  <p>Start Date</p>
                </div>
                <div className="w-1/2 h-auto">
                  <input
                    onChange={(e) => setStartDate(e.target.value)}
                    type="date"
                    className="w-full p-1 rounded-md shadow-xl"
                  />
                </div>
              </div>
              <div className="w-1/2 gap-2 h-auto justify-between flex items-center">
                <div className="w-1/2 h-auto">
                  <p>End Date</p>
                </div>
                <div className="w-1/2 h-auto">
                  <input
                    onChange={(e) => setEndDate(e.target.value)}
                    type="date"
                    className="w-full p-1 rounded-md shadow-xl"
                  />
                </div>
              </div>
            </form>
            <button
              onClick={() => filterByDate()}
              className="w-full h-auto rounded-md shadow-xl p-2 bg-slate-300"
            >
              Submit
            </button>
          </div>
          <div className="w-full h-96 overflow-y-auto shadow-xl flex flex-col bg-white">
            {filterData.length > 0 ||
            priceCategory === "food" ||
            priceCategory === "salary" ||
            priceCategory === "transport" ||
            (startDate && endDate)
              ? showfilterByDate
              : showExpense}
          </div>
        </div>
        <div className="w-full min-h-[80vh] p-5 shadow-xl flex justify-center items-center bg-white">
          <div className="w-full min-h-[40vh] ">
            <div className="w-full h-auto  p-5 flex flex-col gap-5">
              <form className="w-full h-auto flex justify-between items-center">
                <p>Type</p>
                <div className="flex gap-5">
                  <div className="flex gap-1">
                    <input
                      type="radio"
                      value="income"
                      checked={type === "income"}
                      onChange={(e) => {
                        setType(e.target.value);
                      }}
                    />
                    <label htmlFor="income">Income</label>
                  </div>
                  <div className="flex gap-1">
                    <input
                      type="radio"
                      value="expense"
                      checked={type === "expense"}
                      onChange={(e) => {
                        setType(e.target.value);
                      }}
                    />
                    <label htmlFor="expense">Expense</label>
                  </div>
                </div>
              </form>
              <form className="w-full h-auto flex justify-between items-center">
                <p>Title</p>
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                    className="rounded-md shadow-xl p-1"
                  />
                </div>
              </form>
              <form className="w-full h-auto flex justify-between items-center">
                <p>Nominal</p>
                <div>
                  <input
                    value={nominal}
                    type="number"
                    onChange={(e) => {
                      setNominal(parseInt(e.target.value));
                    }}
                    className="rounded-md shadow-xl p-1"
                  />
                </div>
              </form>
              <form className="w-full h-auto flex justify-between items-center">
                <p>Category</p>
                <div>
                  <select
                    className="w-[13.8rem] rounded-md shadow-xl h-auto p-1"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="salary">Salary</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>
              </form>
              <button
                onClick={addData}
                className="w-full h-auto p-2 shadow-xl bg-slate-300 rounded-xl"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
