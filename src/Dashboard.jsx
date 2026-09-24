"use client";

import { useMemo, useState } from "react";
import dashboardData from "../data/dashboard-data.json";

const MONTHS = [
  { value: "2026-10", label: "October 2026", short: "Oct 26" },
  { value: "2026-11", label: "November 2026", short: "Nov 26" },
  { value: "2026-12", label: "December 2026", short: "Dec 26" },
  { value: "2027-01", label: "January 2027", short: "Jan 27" },
  { value: "2027-02", label: "February 2027", short: "Feb 27" },
  { value: "2027-03", label: "March 2027", short: "Mar 27" },
  { value: "2027-04", label: "April 2027", short: "Apr 27" },
  { value: "2027-05", label: "May 2027", short: "May 27" },
  { value: "2027-06", label: "June 2027", short: "Jun 27" },
];

const PERIODS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "Q4 2026", label: "Q4 2026" },
  { value: "Q1 2027", label: "Q1 2027" },
  { value: "Q2 2027", label: "Q2 2027" },
  { value: "october", label: "October Focus" },
];

const number = new Intl.NumberFormat("th-TH");

function Icon({ name }) {
  const paths = {
    sim: (
      <>
        <path d="M8 2h8l4 4v16H4V6z" />
        <path d="M8 14h8M8 18h8M8 10h3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </>
    ),
    alert: (
      <>
        <path d="M12 3 2.8 20h18.4z" />
        <path d="M12 9v5M12 17h.01" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    shop: (
      <>
        <path d="M3 10h18l-2-6H5zM5 10v10h14V10M9 20v-6h6v6" />
        <path d="M3 10c0 2 3 3 4.5 1.5C9 13 12 12 12 10c0 2 3 3 4.5 1.5C18 13 21 12 21 10" />
      </>
    ),
    filter: (
      <>
        <path d="M4 5h16M7 12h10M10 19h4" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    reset: (
      <>
        <path d="M4 4v6h6M20 20v-6h-6" />
        <path d="M5.5 15a8 8 0 0 0 13-6M18.5 9a8 8 0 0 0-13 6" />
      </>
    ),
  };
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function MetricCard({ label, value, context, tone = "blue", icon = "sim", active = false }) {
  return (
    <article className={`metric-card tone-${tone}${active ? " metric-active" : ""}`}>
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon"><Icon name={icon} /></span>
      </div>
      <strong>{number.format(value)}</strong>
      <small>{context}</small>
    </article>
  );
}

function sum(records) {
  return records.reduce((total, row) => total + row.count, 0);
}

function aggregate(records, key) {
  const map = new Map();
  for (const row of records) {
    const label = row[key] || "#N/A";
    map.set(label, (map.get(label) || 0) + row.count);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function percent(value, total) {
  if (!total) return "0.0";
  return ((value / total) * 100).toFixed(1);
}

function ExecutiveAnalysis({ records, cleanRecords, topAreas, topShops, selectedLabel }) {
  const selectedTotal = sum(records);
  const cleanTotal = sum(cleanRecords);
  const issueTotal = sum(records.filter((row) => row.quality !== "complete"));
  const monthRanking = MONTHS
    .map((month) => ({
      ...month,
      value: sum(records.filter((row) => row.month === month.value)),
    }))
    .sort((a, b) => b.value - a.value);
  const peakMonth = monthRanking[0];
  const topFiveTotal = topAreas.reduce((total, row) => total + row.value, 0);
  const quarterRanking = PERIODS
    .filter((item) => item.value.startsWith("Q"))
    .map((item) => ({
      label: item.label,
      value: sum(records.filter((row) => row.quarter === item.value)),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
  const quarterSignal = quarterRanking.length
    ? `ช่วงที่สูงสุดคือ ${quarterRanking[0].label} จำนวน ${number.format(quarterRanking[0].value)} SIM (${percent(quarterRanking[0].value, selectedTotal)}%)`
    : "ไม่พบข้อมูลรายไตรมาสในตัวกรองนี้";

  if (!selectedTotal) {
    return (
      <section className="panel executive-panel" aria-labelledby="executive-title">
        <div className="executive-heading">
          <div>
            <span className="executive-kicker">EXECUTIVE VIEW</span>
            <h2 id="executive-title">บทวิเคราะห์สำหรับผู้บริหาร</h2>
          </div>
          <span className="analysis-scope">{selectedLabel}</span>
        </div>
        <p className="executive-empty">ไม่พบข้อมูลตามตัวกรอง จึงยังไม่สามารถจัดลำดับพื้นที่และคำแนะนำได้</p>
      </section>
    );
  }

  return (
    <section className="panel executive-panel" aria-labelledby="executive-title">
      <div className="executive-heading">
        <div>
          <span className="executive-kicker">EXECUTIVE VIEW</span>
          <h2 id="executive-title">บทวิเคราะห์และข้อเสนอแนะสำหรับผู้บริหาร</h2>
          <p>สรุปความเสี่ยงและแนวทางบริหาร SIM Prepaid ที่กำลังหมดอายุ ตามตัวกรองปัจจุบัน</p>
        </div>
        <span className="analysis-scope">{selectedLabel}</span>
      </div>

      <div className="executive-summary-grid">
        <article>
          <span className="summary-index">01</span>
          <div>
            <small>แนวโน้มและช่วงเสี่ยง</small>
            <strong>{number.format(selectedTotal)} SIM อยู่ในขอบเขตที่เลือก</strong>
            <p>
              สูงสุดใน {peakMonth?.label || "-"} {number.format(peakMonth?.value || 0)} SIM
              {" "}({percent(peakMonth?.value || 0, selectedTotal)}%) · {quarterSignal}
            </p>
          </div>
        </article>
        <article>
          <span className="summary-index">02</span>
          <div>
            <small>ความเสี่ยงกระจุกตัว</small>
            <strong>Top 5 Areas รวม {number.format(topFiveTotal)} SIM</strong>
            <p>
              คิดเป็น {percent(topFiveTotal, cleanTotal)}% ของข้อมูลที่จัด Area ได้
              {topAreas[0] ? ` นำโดย ${topAreas[0].label} ${number.format(topAreas[0].value)} SIM` : ""}
            </p>
          </div>
        </article>
        <article>
          <span className="summary-index">03</span>
          <div>
            <small>จุดปฏิบัติการหลัก</small>
            <strong>{topShops[0]?.label || "ยังระบุสาขาไม่ได้"}</strong>
            <p>
              {topShops[0]
                ? `มี ${number.format(topShops[0].value)} SIM ควรกำหนดเจ้าของงานและติดตามยอดคงเหลือเป็นรายสัปดาห์`
                : "ควรตรวจสอบข้อมูลสาขาก่อนมอบหมายผู้รับผิดชอบ"}
            </p>
          </div>
        </article>
      </div>

      <div className="management-actions">
        <div className="action-heading">
          <div>
            <span className="executive-kicker">RECOMMENDED ACTIONS</span>
            <h3>แผนบริหารจัดการที่แนะนำ</h3>
          </div>
          <span className="issue-status">{issueTotal ? `ข้อมูลรอตรวจสอบ ${number.format(issueTotal)} SIM` : "ข้อมูลพื้นที่ครบถ้วน"}</span>
        </div>
        <ol>
          <li>
            <span>เร่งด่วน</span>
            <div>
              <strong>ปิดความเสี่ยงก่อนหมดอายุ</strong>
              <p>
                ให้ Area และสาขาอันดับต้นจัดทำรายชื่อ SIM เจ้าของงาน และแผน Activate / จำหน่าย / คืนหรือเปลี่ยนสินค้า
                พร้อมติดตามทุกสัปดาห์จนยอดคงค้างเป็นศูนย์
              </p>
            </div>
          </li>
          <li>
            <span>ถัดไป</span>
            <div>
              <strong>ปรับสมดุลสต็อกระหว่างสาขา</strong>
              <p>
                ตรวจสอบยอดใช้งานจริงก่อนย้าย SIM จากสาขาที่มีจำนวนหมดอายุสูง ไปยังสาขาที่มีอัตราการใช้หรือจำหน่ายดีกว่า
                โดยให้ความสำคัญกับ Top 5 Areas ก่อน
              </p>
            </div>
          </li>
          <li>
            <span>ควบคุม</span>
            <div>
              <strong>ตั้ง KPI และยกระดับคุณภาพข้อมูล</strong>
              <p>
                รายงานจำนวนคงค้าง อัตราที่จัดการสำเร็จ และรายการเลยกำหนดเป็นรายสัปดาห์
                พร้อมแก้ข้อมูล #N/A ให้ครบ เพื่อให้การมอบหมายผู้รับผิดชอบแม่นยำ
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="management-target">
        <strong>เกณฑ์บริหารแนะนำ</strong>
        <span>มีเจ้าของครบทุกสาขา · เคลียร์รายการเร่งด่วนอย่างน้อย 80% ก่อนหมดอายุ 14 วัน · ข้อมูล #N/A ต้องเป็น 0</span>
      </div>
      <p className="analysis-note">ข้อเสนอแนะนี้ใช้จำนวน SIM และวันหมดอายุจาก Dashboard เป็นฐาน ควรพิจารณาร่วมกับยอดขาย อัตรา Activate และข้อกำหนดการคืนสินค้าจริง</p>
    </section>
  );
}

function Ranking({ title, subtitle, data, tone = "blue", emptyText = "ไม่พบข้อมูลตามตัวกรอง" }) {
  const max = Math.max(...data.map((row) => row.value), 1);
  return (
    <section className="panel ranking-panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {data.length ? (
        <ol className="ranking-list">
          {data.map((row, index) => (
            <li key={row.label}>
              <span className="rank-number">{index + 1}</span>
              <div className="rank-main">
                <div className="rank-label">
                  <span>{row.label}</span>
                  <strong>{number.format(row.value)}</strong>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <span
                    className={`bar-fill bar-${tone}`}
                    style={{ width: `${Math.max((row.value / max) * 100, 3)}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-state">{emptyText}</p>
      )}
    </section>
  );
}

function MonthlyChart({ records }) {
  const values = MONTHS.map((month) => ({
    ...month,
    count: sum(records.filter((row) => row.month === month.value)),
  }));
  const max = Math.max(...values.map((item) => item.count), 1);
  return (
    <section className="panel monthly-panel">
      <div className="panel-heading">
        <div>
          <h2>แนวโน้ม SIM หมดอายุรายเดือน</h2>
          <p>จำนวน SIM ตั้งแต่ October 2026–June 2027</p>
        </div>
        <span className="legend"><i /> SIM หมดอายุ</span>
      </div>
      <div className="monthly-chart" role="img" aria-label="กราฟจำนวน SIM หมดอายุรายเดือน">
        <div className="chart-grid" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
        {values.map((item) => (
          <div className="month-column" key={item.value}>
            <strong>{number.format(item.count)}</strong>
            <div className="column-track">
              <span
                className={item.value === "2026-10" ? "column-fill column-focus" : "column-fill"}
                style={{ height: `${item.count ? Math.max((item.count / max) * 100, 4) : 0}%` }}
              />
            </div>
            <span>{item.short}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DetailTable({ records }) {
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const pages = Math.max(Math.ceil(records.length / pageSize), 1);
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * pageSize;
  const rows = records.slice(start, start + pageSize);

  return (
    <section className="panel detail-panel">
      <div className="panel-heading detail-heading">
        <div>
          <h2>รายละเอียด SIM ตามตัวกรอง</h2>
          <p>แสดง {number.format(records.length)} รายการ</p>
        </div>
        <div className="pagination">
          <button
            type="button"
            onClick={() => setPage(Math.max(safePage - 1, 1))}
            disabled={safePage === 1}
            aria-label="หน้าก่อนหน้า"
          >
            ‹
          </button>
          <span>{safePage} / {pages}</span>
          <button
            type="button"
            onClick={() => setPage(Math.min(safePage + 1, pages))}
            disabled={safePage === pages}
            aria-label="หน้าถัดไป"
          >
            ›
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>เดือน</th>
              <th>Area</th>
              <th>สาขา</th>
              <th>Material</th>
              <th>Serial number</th>
              <th className="number-cell">จำนวน</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row, index) => (
              <tr key={`${row.serial}-${row.month}-${index}`}>
                <td><span className={`month-pill${row.month === "2026-10" ? " focus-pill" : ""}`}>{row.monthLabel}</span></td>
                <td>
                  {row.quality === "missing"
                    ? <span className="issue-pill">#N/A</span>
                    : row.area}
                </td>
                <td>{row.shop}</td>
                <td className="mono">{row.material}</td>
                <td className="mono serial-cell">{row.serial}</td>
                <td className="number-cell">{number.format(row.count)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="empty-cell">ไม่พบข้อมูลตามตัวกรองที่เลือก</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState("all");
  const [month, setMonth] = useState("all");
  const [area, setArea] = useState("all");
  const [search, setSearch] = useState("");

  const areas = useMemo(
    () => [...new Set(dashboardData.records.map((row) => row.area))]
      .sort((a, b) => {
        if (a === "#N/A") return 1;
        if (b === "#N/A") return -1;
        return a.localeCompare(b);
      }),
    [],
  );

  const areaSearchRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    return dashboardData.records.filter((row) => {
      if (area !== "all" && row.area !== area) return false;
      if (term && !`${row.shop} ${row.material} ${row.serial}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [area, search]);

  const filtered = useMemo(() => areaSearchRecords.filter((row) => {
    if (period.startsWith("Q") && row.quarter !== period) return false;
    if (period === "october" && row.month !== "2026-10") return false;
    if (month !== "all" && row.month !== month) return false;
    return true;
  }), [areaSearchRecords, month, period]);

  const cleanFiltered = filtered.filter((row) => row.quality === "complete");
  const topAreas = aggregate(cleanFiltered, "area").slice(0, 5);
  const topShops = aggregate(cleanFiltered, "shop").slice(0, 10);
  const selectedTotal = sum(filtered);
  const selectedLabel = period === "all"
    ? (month === "all" ? "ทุกช่วงเวลา" : MONTHS.find((item) => item.value === month)?.label)
    : PERIODS.find((item) => item.value === period)?.label;
  const peakMonth = MONTHS
    .map((item) => ({ ...item, value: sum(filtered.filter((row) => row.month === item.value)) }))
    .sort((a, b) => b.value - a.value)[0];

  const choosePeriod = (value) => {
    setPeriod(value);
    setMonth("all");
  };

  const reset = () => {
    setPeriod("all");
    setMonth("all");
    setArea("all");
    setSearch("");
  };

  return (
    <main>
      <header className="hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow">WIRE &amp; WIRELESS TEAM</span>
            <h1>SIM Prepaid Expiry Dashboard</h1>
            <p>ติดตาม SIM หมดอายุครบ 15 Areas · October 2026–June 2027</p>
          </div>
          <div className="hero-meta">
            <span>ข้อมูลล่าสุด</span>
            <strong>25 September 2026</strong>
            <small>Source: {dashboardData.source}</small>
          </div>
        </div>
      </header>

      <div className="dashboard-shell">
        <section className="filter-panel" aria-label="ตัวกรองข้อมูล">
          <div className="filter-title">
            <Icon name="filter" />
            <div>
              <strong>ตัวกรอง Dashboard</strong>
              <span>เลือกช่วงเวลา พื้นที่ หรือค้นหาสาขา</span>
            </div>
          </div>
          <div className="period-tabs" aria-label="ช่วงเวลา">
            {PERIODS.map((item) => (
              <button
                type="button"
                key={item.value}
                className={period === item.value ? "active" : ""}
                aria-pressed={period === item.value}
                onClick={() => choosePeriod(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label>
            <span>เดือน</span>
            <select
              value={month}
              onChange={(event) => {
                setMonth(event.target.value);
                setPeriod("all");
              }}
            >
              <option value="all">ทุกเดือน</option>
              {MONTHS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            <span>Area</span>
            <select value={area} onChange={(event) => setArea(event.target.value)}>
              <option value="all">ครบทั้ง 15 Areas</option>
              {areas.map((item) => (
                <option key={item} value={item}>{item === "#N/A" ? "ข้อมูล #N/A" : item}</option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span>ค้นหาสาขา / Serial</span>
            <div>
              <Icon name="search" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="พิมพ์ชื่อสาขาหรือเลข SIM"
              />
            </div>
          </label>
          <button type="button" className="reset-button" onClick={reset}>
            <Icon name="reset" /> ล้างตัวกรอง
          </button>
        </section>

        <section className="metric-grid" aria-label="ตัวเลขสรุป">
          <MetricCard label="SIM ทั้งหมด" value={dashboardData.totals.total} context="ข้อมูลทุก Area รวม #N/A" tone="navy" icon="sim" />
          <MetricCard label="Q4 2026 · Oct–Dec" value={dashboardData.totals.q4_2026} context={`${percent(dashboardData.totals.q4_2026, dashboardData.totals.total)}% ของ SIM ทั้งหมด`} tone="blue" icon="calendar" />
          <MetricCard label="Q1 2027 · Jan–Mar" value={dashboardData.totals.q1_2027} context={`${percent(dashboardData.totals.q1_2027, dashboardData.totals.total)}% ของ SIM ทั้งหมด`} tone="cyan" icon="calendar" />
          <MetricCard label="Q2 2027 · Apr–Jun" value={dashboardData.totals.q2_2027} context={`${percent(dashboardData.totals.q2_2027, dashboardData.totals.total)}% ของ SIM ทั้งหมด`} tone="purple" icon="calendar" />
          <MetricCard label="October Focus" value={dashboardData.totals.october} context={`${percent(dashboardData.totals.october, dashboardData.totals.total)}% ของ SIM ทั้งหมด`} tone="orange" icon="pin" active={period === "october" || month === "2026-10"} />
          <MetricCard label="ผลตามตัวกรอง" value={selectedTotal} context={selectedLabel || "ตัวกรองที่เลือก"} tone="purple" icon="filter" active />
          <MetricCard label="ข้อมูลต้องตรวจสอบ" value={dashboardData.totals.issues} context="Area / Shop เป็น #N/A" tone="red" icon="alert" />
        </section>

        <section className="insight-strip" aria-label="ประเด็นสำคัญ">
          <div>
            <span className="insight-icon"><Icon name="pin" /></span>
            <div>
              <small>Area ที่ต้องเร่งติดตาม</small>
              <strong>{topAreas[0]?.label || "ไม่พบข้อมูล"}</strong>
            </div>
            <b>{topAreas[0] ? number.format(topAreas[0].value) : "0"} SIM</b>
          </div>
          <div>
            <span className="insight-icon"><Icon name="shop" /></span>
            <div>
              <small>สาขาที่มี SIM มากที่สุด</small>
              <strong>{topShops[0]?.label || "ไม่พบข้อมูล"}</strong>
            </div>
            <b>{topShops[0] ? number.format(topShops[0].value) : "0"} SIM</b>
          </div>
          <div>
            <span className="insight-icon warning"><Icon name="calendar" /></span>
            <div>
              <small>เดือนที่มี SIM หมดอายุสูงสุด</small>
              <strong>{peakMonth?.label || "ไม่พบข้อมูล"}</strong>
            </div>
            <b>{number.format(peakMonth?.value || 0)} SIM</b>
          </div>
        </section>

        <ExecutiveAnalysis
          records={filtered}
          cleanRecords={cleanFiltered}
          topAreas={topAreas}
          topShops={topShops}
          selectedLabel={selectedLabel || "ตัวกรองปัจจุบัน"}
        />

        <div className="chart-grid-layout">
          <MonthlyChart records={areaSearchRecords.filter((row) => {
            if (period.startsWith("Q")) return row.quarter === period;
            if (period === "october") return row.month === "2026-10";
            if (month !== "all") return row.month === month;
            return true;
          })} />
          <Ranking
            title={period === "october" || month === "2026-10" ? "Top 5 Areas · October 2026" : "Top 5 Areas"}
            subtitle={`อันดับตาม ${selectedLabel || "ตัวกรองปัจจุบัน"}`}
            data={topAreas}
            tone={period === "october" || month === "2026-10" ? "orange" : "cyan"}
          />
        </div>

        <Ranking
          title={period === "october" || month === "2026-10" ? "สาขาเป้าหมายใน October 2026 · Top 10" : "สาขาที่มี SIM หมดอายุมากที่สุด · Top 10"}
          subtitle="ใช้สำหรับจัดลำดับการติดตามและมอบหมายผู้รับผิดชอบ"
          data={topShops}
          tone={period === "october" || month === "2026-10" ? "orange" : "blue"}
        />

        <DetailTable records={filtered} />

        <footer>
          <span>จำนวนรวมอ้างอิงจากไฟล์ต้นฉบับ {number.format(dashboardData.totals.total)} SIM</span>
          <span>รายการ #N/A แยกออกจาก Area และ Branch Ranking</span>
        </footer>
      </div>
    </main>
  );
}
