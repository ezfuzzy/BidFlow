// SearchByIndstrytyCd.jsx
import React, { useState } from "react"
import axios from "axios"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import BidList from "./BidList"

const api_key = process.env.REACT_APP_BidPublicInfoService_API_KEY_DEC
const PRESET_CODES = ["1162", "1164", "1172", "1173", "1192", "1260"]

const formatDate = (date, end = false) => {
  if (!date) return ""
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}${m}${d}${end ? "2359" : "0000"}`
}

const SearchByIndstrytyCd = () => {
  const today = new Date()
  today.setHours(23, 59, 0, 0)

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 31)

  const [bidNtceNm, setBidNtceNm] = useState("")
  const [excludeKeyword, setExcludeKeyword] = useState("")
  const [regionCode, setRegionCode] = useState("")
  const [indstrytyCd, setIndstrytyCd] = useState("")
  const [activeCode, setActiveCode] = useState(null)
  const [startDate, setStartDate] = useState(start)
  const [endDate, setEndDate] = useState(today)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(null)
  const rowsPerPage = 20

  const fetchData = async (code = null, page = 1) => {
    const finalCode = code || indstrytyCd
    if (!startDate || !endDate) return alert("조회 시작일과 종료일을 선택해주세요.")

    setLoading(true)
    setError(null)
    setData([])

    const baseUrl = "http://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServcPPSSrch"
    const queryParams = {
      inqryDiv: "2",
      pageNo: page.toString(),
      numOfRows: rowsPerPage.toString(),
      inqryBgnDt: formatDate(startDate),
      inqryEndDt: formatDate(endDate, true),
      bidNtceNm: bidNtceNm,
      ServiceKey: api_key,
      indstrytyCd: finalCode,
      prtcptLmtRgnCd: regionCode,
      type: "json",
    }

    try {
      const response = await axios.get(baseUrl, { params: queryParams })
      const rawItems = response.data.response.body.items || []
      const filtered = rawItems.filter((item) => item.ntceKindNm !== "취소공고" && item.ntceKindNm !== "연기공고" && (!excludeKeyword || !item.bidNtceNm?.includes(excludeKeyword)))

      const items = filtered.map((item, idx) => ({
        ...item,
        listOrder: (page - 1) * rowsPerPage + idx + 1,
      }))

      // test code
      // rawItems.map((items, idx) => console.log(idx + " : " + items.bidNtceNm + " : " + items.ntceKindNm))
      // items.map((items, idx) => console.log(idx + " : " + items.bidNtceNm + " : " + items.ntceKindNm))

      setData(items)
      setTotalCount(response.data.response.body.totalCount)
      // TODO: 일단 데이터 개선 요청 넣어놨음 1. 지역 검색조건 최적화 2. 공고종류(상태) 검색조건 추가 3. 제외 키워드 검색조건 추가
      // setTotalCount(filtered.length)
      // 일단 가져오는 공고 개수가 20개니까 총 개수에서 몇개나 필터링될지 모름
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
    setBidNtceNm("")
    setExcludeKeyword("")
    setRegionCode("")
    setIndstrytyCd("")
    setActiveCode(null)
    setStartDate(start)
    setEndDate(today)
    setData([])
    setError(null)
    setCurrentPage(1)
    setTotalCount(null)
  }

  const totalPages = Math.ceil(totalCount / rowsPerPage)

  /* 다운로드 */
  const formatDataToText = (data) => {
    return data
      .map((item) => {
        return `${item.rgstTyNm}\t${item.bidClseDt}\t${item.sucsfbidLwltRate}\t${indstrytyCd ?? "-"}\t${regionCode ?? "-"}\t${(item.sucsfbidLwltRate / 100).toFixed(5)}\t${
          item.asignBdgtAmt
        }`
      })
      .join("\n")
  }

  const handleDownload = (data) => {
    const formattedText = formatDataToText(data)

    const blob = new Blob([formattedText], { type: "text/plain;charset=utf-8" })

    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "list.txt" // 파일 이름
    a.click()

    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl font-bold mb-6">Search by indstrytyCd</h1>

      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div>
          <label className="block text-sm font-medium mb-1">공고 제목 포함</label>
          <input type="text" value={bidNtceNm} onChange={(e) => setBidNtceNm(e.target.value)} placeholder="예: 청소" className="border p-2 rounded w-48" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">제외 키워드</label>
          <input type="text" value={excludeKeyword} onChange={(e) => setExcludeKeyword(e.target.value)} placeholder="예: 청소년" className="border p-2 rounded w-48" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">지역제한코드</label>
          <input type="text" value={regionCode} onChange={(e) => setRegionCode(e.target.value)} placeholder="예: 11" className="border p-2 rounded w-48" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">시작일</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              const adjusted = new Date(date)
              adjusted.setHours(0, 0, 0, 0)
              setStartDate(adjusted)
            }}
            dateFormat="yyyy-MM-dd"
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">종료일</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              const adjusted = new Date(date)
              adjusted.setHours(23, 59, 0, 0)
              setEndDate(adjusted)
            }}
            dateFormat="yyyy-MM-dd"
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">업종코드</label>
          <input
            type="text"
            value={indstrytyCd}
            onChange={(e) => {
              setIndstrytyCd(e.target.value)
              setActiveCode(null)
            }}
            placeholder="예: 1172"
            className="border p-2 rounded w-48"
          />
        </div>
        <div className="flex gap-2 items-end">
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

      <div className="mb-6 flex flex-wrap gap-3">
        {PRESET_CODES.map((code) => (
          <button
            key={code}
            onClick={() => handleCodeClick(code)}
            className={`px-4 py-2 rounded border ${activeCode === code ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
            {code}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {totalCount && (
        <div className="flex justify-between items-center mb-5">
          <p className="text-black-500">총 {totalCount}개 검색됨</p>
          <button
            onClick={() => handleDownload(data)}
            className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all">
            현재 목록 다운로드
          </button>
        </div>
      )}

      {data.length > 0 && <BidList items={data} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
    </div>
  )
}

export default SearchByIndstrytyCd
