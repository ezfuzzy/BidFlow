// SearchByIndstrytyCd.jsx
import React, { useState } from "react"
import axios from "axios"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import BidList from "./BidList"

const api_key = process.env.REACT_APP_BidPublicInfoService_API_KEY_DEC
const PRESET_CODES = ["1162", "1164", "1172", "1173", "1192", "1260"] // constants로 빼기

const formatDate = (date, end = false) => {
  if (!date) return ""
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}${m}${d}${end ? "2359" : "0000"}`
}

const SearchByIndstrytyCd = () => {
  const [bidNtceNm, setBidNtceNm] = useState("")
  const [indstrytyCd, setIndstrytyCd] = useState("")
  const [activeCode, setActiveCode] = useState(null)
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)))
  const [endDate, setEndDate] = useState(new Date())
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const rowsPerPage = 20

  const fetchData = async (code = null, page = 1) => {
    const finalCode = code || indstrytyCd
    if (!finalCode) return alert("산업코드를 입력하거나 버튼을 선택하세요.")
    if (!startDate || !endDate) return alert("조회 시작일과 종료일을 선택해주세요.")

    setLoading(true)
    setError(null)
    setData([])

    const baseUrl = "http://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServcPPSSrch"
    const queryParams = {
      inqryDiv: "1",
      pageNo: page.toString(),
      numOfRows: rowsPerPage.toString(),
      inqryBgnDt: formatDate(startDate),
      inqryEndDt: formatDate(endDate, true),

      bidNtceNm: bidNtceNm,

      ServiceKey: api_key,
      indstrytyCd: finalCode,
      type: "json",
    }

    try {
      const response = await axios.get(baseUrl, { params: queryParams })
      const items = response.data.response.body.items.map((item, idx) => ({
        ...item,
        listOrder: (page - 1) * rowsPerPage + idx + 1,
      }))
      setData(items)
      setTotalCount(response.data.response.body.totalCount)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCodeClick = (code) => {
    setIndstrytyCd(code)
    setActiveCode(code)
    setCurrentPage(1)
    fetchData(code, 1)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    fetchData(null, newPage)
  }

  const resetForm = () => {
    const today = new Date()
    const lastMonth = new Date(new Date().setDate(today.getDate() - 30))
    setIndstrytyCd("")
    setActiveCode(null)
    setStartDate(lastMonth)
    setEndDate(today)
    setData([])
    setError(null)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalCount / rowsPerPage)

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl font-bold mb-6">Search by indstrytyCd</h1>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div>
          <label className="block text-sm font-medium mb-1">공고 제목</label>
          <input
            type="text"
            value={bidNtceNm}
            onChange={(e) => {
              setBidNtceNm(e.target.value)
            }}
            placeholder="Enter indstrytyCd"
            className="border p-2 rounded w-48"
          />
        </div>

        {/* 검색 시작일과 종료일 */}
        <div>
          <label className="block text-sm font-medium mb-1">시작일</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">종료일</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border p-2 rounded"
          />
        </div>

        {/* 검색 옵션 - 업종 코드 */}
        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">업종코드</label>
            <input
              type="text"
              value={indstrytyCd}
              onChange={(e) => {
                setIndstrytyCd(e.target.value)
                setActiveCode(null)
              }}
              placeholder="Enter indstrytyCd"
              className="border p-2 rounded w-48"
            />
            <button
              onClick={() => {
                setCurrentPage(1)
                fetchData(null, 1)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              검색
            </button>
            <button onClick={resetForm} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
              초기화
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {PRESET_CODES.map((code) => (
          <button
            key={code}
            onClick={() => handleCodeClick(code)}
            className={`px-4 py-2 rounded border ${
              activeCode === code ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}>
            {code}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {data.length > 0 && (
        <BidList items={data} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  )
}

export default SearchByIndstrytyCd
