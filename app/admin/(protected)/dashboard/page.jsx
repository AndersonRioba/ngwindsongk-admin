'use client'
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import dynamic from 'next/dynamic';
import { fetcher } from "@/app/lib/data";
import Overlay from "@/app/UI/Overlay";
import { CalenderRange } from "@/app/UI/Calender";
import Spinner from "@/app/UI/Spinner";

const Doughnut = dynamic(() => import('react-chartjs-2').then((mod) => mod.Doughnut), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { ssr: false });

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  PointElement,
  LineElement,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function formatCurrency(value) {
  return `Ksh${Number(value || 0).toLocaleString()}`
}

function formatMetric(value, suffix = '') {
  if (suffix) return `${Number(value || 0).toLocaleString()} ${suffix}`.trim()
  return Number(value || 0).toLocaleString()
}

function percentageText(value) {
  const numeric = Number(value || 0)
  const sign = numeric > 0 ? '+' : ''
  return `${sign}${numeric}%`
}

function TrendChart({ dataInput, colour }) {
  const data = {
    labels: dataInput.map((_, index) => index + 1),
    datasets: [{
      data: dataInput,
      borderColor: colour,
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      pointRadius: 0,
    }]
  };

  const options = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false, min: 0 },
    },
  };

  return <Line options={options} data={data} />
}

function StatusDoughnut({ labels, values, colours }) {
  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colours,
      borderColor: colours,
      borderWidth: 0,
    }],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, font: { size: 11 }, padding: 18 },
      },
    },
  };

  return <Doughnut data={data} options={options} />
}

function OrdersBarChart({ labels, values }) {
  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: ['#6d31ed', '#15abff', '#22c55e', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return <Bar data={chartData} options={options} />
}

function InventoryGauge({ used, available }) {
  const data = {
    labels: ['Used', 'Available'],
    datasets: [{
      data: [used, available],
      backgroundColor: ['#6d31ed', '#6d31ed60'],
      borderWidth: 0,
    }],
  };

  const options = {
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    cutout: '70%',
    plugins: { legend: { display: false }, title: { display: false } },
  };

  return <Doughnut data={data} options={options} />
}

function MetricCard({ title, value, icon, colour, colourStyling, text, rate, data, suffix = '', formatter = formatMetric }) {
  return (
    <div className="min-w-[80%] md:min-w-fit shadow-lg p-4 rounded-lg bg-white">
      <div className="flex flex-col md:flex-row">
        <div className="flex items-center gap-3">
          <div className={`border-2 ${colourStyling} rounded-full w-14 h-14 p-1 flex items-center justify-center mr-2`}>
            <span className={`${icon} w-10 h-10`} />
          </div>
          <div>
            <p className="mb-2">{title}</p>
            <p className="font-semibold text-xl">{formatter(value, suffix)}</p>
          </div>
        </div>

        <div className="flex-grow flex h-20 mt-5 md:mt-0">
          <div className="w-2/3 mx-auto"><TrendChart dataInput={data} colour={colour} /></div>
        </div>
      </div>

      <div className="flex flex-row md:items-center gap-5 pt-4 mt-4 border-t-2">
        <div className={`${Number(rate) >= 0 ? 'bg-Success/30' : 'bg-Error/70'} p-2 rounded-full h-fit text-xs flex items-center`}>
          <span className={`${Number(rate) >= 0 ? 'icon-[ph--arrow-up]' : 'icon-[ph--arrow-down]'} w-4 h-4`} />
          <span>{percentageText(rate)}</span>
        </div>
        <span className="text-sm lg:text-xs 2xl:text-sm">{text}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [time, setTime] = useState('7D')
  const [page, setPage] = useState('')
  const [customRange, setCustomRange] = useState(null)

  const params = useMemo(() => {
    if (customRange?.from && customRange?.to) {
      return { date_from: customRange.from, date_to: customRange.to }
    }

    return { time }
  }, [time, customRange])

  const { data, isError, isLoading, mutate } = useSWR(['/logistics', params], fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
    errorRetryInterval: 3000000
  });

  if (isLoading) return <div className="h-[70vh]"><Spinner /></div>
  if (isError) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <span className="icon-[ph--warning-circle] w-16 h-16 text-Error/70" />
      <p className="text-lg font-semibold text-gray-700">Could not load dashboard data</p>
      <p className="text-sm text-gray-500">The server may be unavailable. Please check your connection or try again.</p>
      <button onClick={() => mutate()} className="mt-2 bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all">
        Retry
      </button>
    </div>
  )

  const cards = data?.cards || {}
  const shipmentStatuses = data?.shipment_overview?.statuses || {}
  const orderStatuses = data?.orders?.statuses || {}
  const inventory = data?.inventory || {}
  const topItems = data?.top_items || []
  const routes = data?.routes || []
  const regions = data?.regions || []
  const recentShipments = data?.shipment_overview?.recent || []
  const upcomingOrders = data?.orders?.upcoming || []

  const rangeLabel = customRange?.from && customRange?.to
    ? `${customRange.from} to ${customRange.to}`
    : data?.range?.label || time

  const shipmentLabels = ['Pending', 'In Transit', 'Delivered', 'Cancelled']
  const shipmentValues = [
    shipmentStatuses.pending || 0,
    shipmentStatuses.in_transit || 0,
    shipmentStatuses.delivered || 0,
    shipmentStatuses.cancelled || 0,
  ]

  const orderLabels = ['Pending', 'Processing', 'Completed', 'Cancelled']
  const orderValues = [
    orderStatuses.pending || 0,
    orderStatuses.processing || 0,
    orderStatuses.completed || 0,
    orderStatuses.cancelled || 0,
  ]

  return (
    <main className="px-2 md:px-10 pb-5">
      <div className="2xl:w-10/12 2xl:mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Logistics Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Live analytics for {rangeLabel}</p>
          </div>

          <div className="flex overflow-x-scroll max-w-full py-2 md:py-0 items-center">
            {['Today', 'Yesterday', '7D', '30D', '3M', '6M', '12M'].map((length, i) => (
              <button
                key={i}
                className={`${length === time && !customRange ? 'bg-primary text-white px-8 rounded-sm' : 'border-r-2 border-gray-200 px-3'} py-1`}
                onClick={() => {
                  setCustomRange(null)
                  setTime(length)
                }}
              >
                {length}
              </button>
            ))}
            <button
              className={`ml-2 border-2 rounded-lg py-2 px-2 min-w-32 ${customRange ? 'border-primary text-primary' : ''}`}
              onClick={() => setPage('/custom')}
            >
              Custom <span className="icon-[simple-line-icons--calender] w-4 h-4 ml-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-5 mx-2">
          <section className="bg-white py-6 px-4 rounded-lg h-fit">
            <div className="flex justify-between items-center mb-5 2xl:mb-10">
              <p className="font-semibold text-xl">Shipment Overview</p>
              <Link className="text-primary" href={'/admin/shipments'}>View all</Link>
            </div>

            <div className="h-80 w-80 md:w-96 md:h-96 my-4 relative">
              <StatusDoughnut
                labels={shipmentLabels}
                values={shipmentValues}
                colours={['#6d31ed', '#15abff', '#22c55e', '#bdc1ca']}
              />
              <div className="absolute top-1/3 left-[42%] text-center">
                <span className="text-sm lg:text-xs 2xl:text-sm text-gray-600">Total</span>
                <p className="text-3xl font-semibold">{data?.shipment_overview?.total || 0}</p>
              </div>
            </div>

            <div className="mt-12">
              <p className="mb-4 font-semibold text-lg">Recent Shipments</p>
              {recentShipments.length === 0 ? (
                <p className="text-sm text-gray-400">No shipments in this range.</p>
              ) : recentShipments.map((shipment) => {
                const colourMap = {
                  pending: 'text-[#6d31ed] bg-[#6d31ed]/10',
                  in_transit: 'text-[#15abff] bg-[#15abff]/10',
                  delivered: 'text-[#22c55e] bg-[#22c55e]/10',
                  cancelled: 'text-gray-600 bg-[#bdc1ca]/10',
                }

                return (
                  <div key={shipment.id} className="bg-gray-100 mx-2 my-4 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <Link href={`/admin/shipments`} className="text-secondary">Shipment #{shipment.id}</Link>
                      <p className={`${colourMap[shipment.status] || colourMap.pending} rounded-full py-1 px-2 text-xs capitalize`}>
                        {shipment.status?.replace('_', ' ')}
                      </p>
                    </div>
                    <p className="text-sm mt-3">
                      <span className="icon-[ph--arrow-right] mr-1 w-3 h-3" />
                      {shipment.orders_count} orders, {formatCurrency(shipment.orders_sum_total)}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>

          <div className="flex-grow">
            <section className="bg-white p-2 flex gap-5 py-3 overflow-x-scroll md:grid md:grid-cols-2 mb-12">
              <MetricCard
                title={'Revenue'}
                value={cards.revenue?.value || 0}
                formatter={formatCurrency}
                icon={'text-[#6D31EDFF] icon-[material-symbols-light--attach-money-rounded]'}
                colourStyling={'bg-[#6D31EDFF]/20 border-[#6D31EDFF]/20'}
                colour={'#6D31EDFF'}
                text={cards.revenue?.text || ''}
                rate={cards.revenue?.rate || 0}
                data={cards.revenue?.trend || [0]}
              />
              <MetricCard
                title={'Discount Cost'}
                value={cards.cost?.value || 0}
                formatter={formatCurrency}
                icon={'text-[#15abff] icon-[material-symbols-light--sell-outline-rounded]'}
                colourStyling={'bg-[#15abff]/10 border-[#15abff]/20'}
                colour={'#15abff'}
                text={cards.cost?.text || ''}
                rate={cards.cost?.rate || 0}
                data={cards.cost?.trend || [0]}
              />
              <MetricCard
                title={'Deliveries'}
                value={cards.deliveries?.value || 0}
                icon={'text-[#ff56a5] icon-[fluent--box-20-regular]'}
                colourStyling={'bg-[#ff56a5]/10 border-[#ff56a5]/20'}
                colour={'#ff56a5'}
                text={cards.deliveries?.text || ''}
                rate={cards.deliveries?.rate || 0}
                data={cards.deliveries?.trend || [0]}
              />
              <MetricCard
                title={'Avg. Delivery Time'}
                value={cards.avg_delivery_time?.value || 0}
                suffix={'days'}
                icon={'text-[#bbac6b] icon-[iconoir--clock]'}
                colourStyling={'bg-[#ffd72a]/10 border-[#ffd72a]/20'}
                colour={'#ffd72a'}
                text={cards.avg_delivery_time?.text || ''}
                rate={cards.avg_delivery_time?.rate || 0}
                data={cards.avg_delivery_time?.trend || [0]}
              />
            </section>

            <div className="flex flex-col md:flex-row gap-8">
              <section className="bg-white p-2 pt-5 flex-grow">
                <div className="flex justify-between items-center mb-5 2xl:mb-10">
                  <p className="font-semibold text-xl">Orders</p>
                  <Link className="text-primary" href={'/admin/sales'}>View all</Link>
                </div>
                <div className="h-96 md:w-10/12 mx-auto"><OrdersBarChart labels={orderLabels} values={orderValues} /></div>
                <div>
                  <p className="my-4 font-semibold">Upcoming Tasks</p>
                  {upcomingOrders.length === 0 ? (
                    <p className="text-sm text-gray-400">No pending tasks in this range.</p>
                  ) : upcomingOrders.map((order) => (
                    <div key={order.id} className="bg-gray-100 mx-3 my-2 rounded-lg p-2">
                      <Link href={`/admin/sales`} className="flex items-center justify-between">
                        <p className="text-secondary">Order #{order.id}</p>
                        <span className="text-xs capitalize text-gray-500">{order.status}</span>
                      </Link>
                      <p className="text-sm mt-3">
                        <span className="icon-[ph--arrow-right] mr-1 w-3 h-3" />
                        Delivery due on {order.due_date}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white p-2 pt-5 flex-grow h-fit pb-10">
                <div className="flex justify-between items-center mb-5">
                  <p className="font-semibold text-xl">Inventory Snapshot</p>
                  <Link className="text-primary" href={'/admin/inventory'}>View all</Link>
                </div>
                <div className="h-60 md:w-10/12 mx-auto relative">
                  <InventoryGauge used={inventory.used_items || 0} available={inventory.available_items || 0} />
                  <div className="absolute top-2/3 left-[36%] text-center">
                    <span className="text-lg text-gray-600">Available</span>
                    <p className="text-3xl font-semibold">{inventory.available_percentage || 0}%</p>
                  </div>
                </div>
                <div>
                  <p className="mt-8 mb-4 font-semibold">Inventory Logs</p>
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <div className="flex justify-between my-3">
                      <p>Current stock</p>
                      <p className="font-semibold">{inventory.available_items || 0} items</p>
                    </div>
                    <div className="flex justify-between my-3 text-Error">
                      <p>Low stock alert</p>
                      <p className="font-semibold">
                        {inventory.low_stock?.[0]
                          ? `${inventory.low_stock[0].name} - ${inventory.low_stock[0].stock} Units`
                          : 'No critical items'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-5 justify-between mt-6">
          <section className="bg-white px-3 flex-grow pt-5">
            <div className="flex justify-between items-center mb-5 2xl:mb-10">
              <p className="font-semibold text-xl">Top Items by Revenue (Ksh)</p>
            </div>
            <div className="space-y-3 pb-5">
              {topItems.length === 0 ? (
                <p className="text-sm text-gray-400">No item sales in this range.</p>
              ) : topItems.map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2 gap-4">
                    <p className="font-medium">{item.label}</p>
                    <p className="font-semibold">{formatCurrency(item.value)}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.max((item.value / (topItems[0]?.value || 1)) * 100, 6)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{item.quantity} units sold</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white px-3 flex-grow pt-5">
            <div className="flex justify-between items-center mb-5 2xl:mb-10">
              <p className="font-semibold text-xl">Low Stock Watchlist</p>
              <Link className="text-primary" href={'/admin/inventory'}>View all</Link>
            </div>
            <div className="space-y-3 pb-5">
              {inventory.low_stock?.length === 0 ? (
                <p className="text-sm text-gray-400">No low stock items right now.</p>
              ) : inventory.low_stock?.map((item) => (
                <div key={`${item.type}-${item.id}`} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center gap-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm font-semibold text-Error">{item.stock} left</p>
                  </div>
                  <p className="text-sm mt-2 text-gray-600 capitalize">{item.type} inventory alert</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white my-5 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-xl font-semibold mb-4">Revenue by Region</p>
          </div>
          <div className="space-y-4">
            {regions.length === 0 ? (
              <p className="text-sm text-gray-400">No regional order data in this range.</p>
            ) : regions.map((region) => (
              <div key={region.label}>
                <div className="flex justify-between items-center mb-2 gap-4">
                  <div>
                    <p className="font-medium">{region.label}</p>
                    <p className="text-xs text-gray-500">{region.orders} orders</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(region.value)}</p>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.max((region.value / (regions[0]?.value || 1)) * 100, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Overlay control={setPage} id={'alpha-overlay'} className={`${page === '' ? 'hidden' : 'block'}`}>
        {page === '/custom' && (
          <CalenderRange
            control={setPage}
            currentFrom={customRange?.from}
            currentTo={customRange?.to}
            onApply={({ from, to }) => {
              if (from && to) {
                setCustomRange({ from, to })
              }
            }}
          />
        )}
      </Overlay>
    </main>
  )
}
