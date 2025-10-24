import { PieChart, LineChart } from "@mui/x-charts"
import { useState } from "react"
import { Tabs } from "./"
import { Filter } from './icons'
import Header from "./Header"
import cls from './styles.module.scss'

// ToDo: Mix into Widget

// ToDo: Make it a Prop
const data = [
  { date: 'TOTAL', type: 'DATA', num: 'DATA' },
  { date: 'DD/MM/YYYY', type: 'DATA', num: 'DATA' },
  { date: 'DD/MM/YYYY', type: 'DATA', num: 'DATA' },
  { date: 'DD/MM/YYYY', type: 'DATA', num: 'DATA' },
  { date: 'DD/MM/YYYY', type: 'DATA', num: 'DATA' },
]


export default function({ title, plot = 'pie', full  = false }) {
  const [selectedSection, setSelectedSection] = useState(0)
  return (
    <div style={{
      borderRadius: '6px',
      border: '1px solid #D9D9D9',
      padding: '24px',
      overflow: 'hidden',
      minWidth: 0,
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.8382 5.19874C20.3274 4.68774 19.721 4.28239 19.0535 4.00582C18.3861 3.72926 17.6707 3.58691 16.9482 3.58691C16.2257 3.58691 15.5103 3.72926 14.8428 4.00582C14.1754 4.28239 13.5689 4.68774 13.0582 5.19874L11.9982 6.25874L10.9382 5.19874C9.90647 4.16705 8.5072 3.58745 7.04817 3.58745C5.58913 3.58745 4.18986 4.16705 3.15817 5.19874C2.12647 6.23043 1.54688 7.62971 1.54688 9.08874C1.54687 10.5478 2.12647 11.947 3.15817 12.9787L4.21817 14.0387L11.9982 21.8187L19.7782 14.0387L20.8382 12.9787C21.3492 12.468 21.7545 11.8616 22.0311 11.1941C22.3076 10.5266 22.45 9.81123 22.45 9.08874C22.45 8.36625 22.3076 7.65084 22.0311 6.98338C21.7545 6.31593 21.3492 5.7095 20.8382 5.19874Z" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{title}</span>
        <div style={{ flex: 1 }}></div>
        {full && <div style={{ padding: '12px', border: '1px solid #767676', background: '#E3E3E3', borderRadius: '8px', cursor: 'pointer' }}>Download CSV of Table</div>}
      </div>
      <p style={{ fontSize: '16px', textDecoration: 'underline', color: '#303030', marginBottom: '36px' }}>View Full Report</p>
      <Tabs items={['Overall', 'By Unique Users', 'By Unique Page Views']} />
      <div style={{ padding: '16px', borderRadius: '6px', border: '1px solid rgb(217, 217, 217)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}></div>
          <Tabs label="" items={['Graph', 'Table']} onChange={setSelectedSection} />
        </div>
        {selectedSection === 0 && <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {plot === 'pie' && <PieChart
            series={[{ data: [
              { id: 0, value: 10, label: 'Provider A', color: '#E8A838' },
              { id: 1, value: 15, label: 'Provider B', color: '#E8C1A0' },
              { id: 2, value: 15, label: 'Provider C', color: '#F1E15B' },
              { id: 3, value: 15, label: 'Provider D', color: '#97E3D5' },
              { id: 4, value: 20, label: 'Provider E', color: '#F47560' },
            ] }]}
            width={full ? 550 : 400}
            height={full ? 350 : 200}
          />}
          {plot === 'line' && <LineChart
            sx={{
              '& .MuiAreaElement-series-first': {
                fill: 'rgba(244, 117, 96, 0.26)',
                stroke: 'rgba(244, 117, 96, 0.26)',
                strokeWidth: 0,
              },
              '& .MuiAreaElement-series-second': {
                fill: '#F7EFA3',
                stroke: '#F7EFA3',
                strokeWidth: 0,
              },
              '& .MuiAreaElement-series-third': {
                fill: '#F2CE8F',
                stroke: '#F2CE8F',
                strokeWidth: 0,
              },
            }}
            xAxis={[{ data: [1, 2, 3, 4] }]}
            // xAxis={[
            //   {
            //     id: 'Years',
            //     dataKey: 'date',
            //     scaleType: 'time',
            //     valueFormatter: (date) => date.getFullYear().toString(),
            //   },
            // ]}
            series={[
              {
                id: 'first',
                data: [50, 7500, 3500, 4000],
                // showMark: ({ index }) => false,
                area: true,
                showMark: false,
                color: 'rgba(244, 117, 96, 0.26)',
              },
              {
                id: 'second',
                data: [50, 6500, 3000, 3000],
                area: true,
                showMark: false,
                color: '#F7EFA3',
              },
              {
                id: 'third',
                data: [45, 5500, 2500, 2000],
                area: true,
                showMark: false,
                color: '#F2CE8F',
              },
            ]}
            width={640}
            height={420}
          />}
          {full && <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Header title="Top Action" content="1 Saving OER" />
          </div>}
        </div>}
        {selectedSection === 1 && <div style={{ padding: '16px', borderRadius: '6px', border: '1px solid rgb(217, 217, 217)' }}>
          <table className={cls.table}>
            <thead>
              <tr>
                <td>
                  DATE
                  {/* <Filter /> */}
                </td>
                <td>
                  ENGAGEMENT TYPE
                  {/* <Filter /> */}
                </td>
                <td>
                  NUMBER OF ENGAGEMENTS
                  {/* <Filter /> */}
                </td>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (<tr>
                <td>{row.date}</td>
                <td>{row.type}</td>
                <td>{row.num}</td>
              </tr>))}
            </tbody>
          </table>
        </div>}
      </div>
    </div>
  )
}
