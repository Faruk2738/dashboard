import Image from 'next/image'
import {
  Activity,
  ArrowDownRight,
  BrainCircuit,
  ChartSpline,
  CircleAlert,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

const forecasts = [
  {
    name: 'Triple Exponential Smoothing',
    eyebrow: 'Trend & seasonality',
    image: '/model-analytics/triple-exponential-smoothing.jpeg',
    alt: 'Triple Exponential Smoothing actual versus predicted weekly sales chart',
    width: 1600,
    height: 744,
    accent: 'from-emerald-500 to-lime-400',
    icon: ChartSpline,
    insight: 'The smoothed forecast establishes a stable baseline around the recent level, but dampens the sharper peaks and troughs in the holdout period.',
    badge: 'Stable baseline',
  },
  {
    name: 'ARIMA & SARIMA',
    eyebrow: 'Statistical forecasting',
    image: '/model-analytics/arima-sarima.jpeg',
    alt: 'ARIMA and SARIMA actual versus predicted weekly sales chart',
    width: 1600,
    height: 744,
    accent: 'from-violet-500 to-fuchsia-400',
    icon: Activity,
    insight: 'Both forecasts remain close to the recent mean. The result is easy to interpret, while short-term volatility is intentionally underrepresented.',
    badge: 'Mean-reverting view',
  },
  {
    name: 'XGBoost',
    eyebrow: 'Machine learning',
    image: '/model-analytics/xgboost-forecast.jpeg',
    alt: 'XGBoost train, test and predicted weekly sales chart',
    width: 1600,
    height: 648,
    accent: 'from-blue-500 to-cyan-400',
    icon: BrainCircuit,
    insight: 'The forecast follows the direction of the test period and reacts to changing sales levels more visibly than the statistical baselines.',
    badge: 'Responsive pattern',
  },
]

export default function ModelAnalyticsPage() {
  return (
    <div lang="en" className="min-h-full bg-[#f4f7fb] text-slate-800">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#174f78] via-[#176b7a] to-[#3b4f86] px-5 pb-16 pt-8 text-white lg:px-8">
        <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-44 left-1/4 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative mx-auto max-w-[1180px]">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div lang="en" className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-400/10 px-3 py-1.5 text-[10px] font-black tracking-[.18em] text-violet-200">
                <Sparkles size={13} /> PREDICTIVE INTELLIGENCE LAB
              </div>
              <h1 className="max-w-3xl text-3xl font-black tracking-tight md:text-4xl">From historical sales to <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">decision-ready forecasts.</span></h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">AdventureWorks weekly sales were evaluated with machine learning and statistical time-series models to understand trend, volatility and forecasting behavior.</p>
            </div>
            <div className="hidden h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_60px_rgba(34,211,238,.12)] backdrop-blur md:flex">
              <BrainCircuit size={48} className="text-cyan-300" strokeWidth={1.5} />
            </div>
          </div>

        </div>
      </section>

      <main className="relative mx-auto -mt-9 max-w-[1180px] px-4 pb-12 lg:px-6">
        <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <article className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-[0_12px_35px_rgba(15,23,42,.07)]">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500"><Activity size={20} /></div><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-rose-500">Data diagnostic</p><h2 className="text-lg font-black text-[#0b2853]">ADF stationarity test</h2></div></div>
            <div className="p-4"><Image src="/model-analytics/adf-test.jpeg" alt="Augmented Dickey-Fuller stationarity test result" width={832} height={410} className="h-auto w-full rounded-xl border border-slate-100" preload /></div>
          </article>

          <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 p-6 text-white shadow-[0_18px_45px_rgba(244,63,94,.22)]">
            <CircleAlert size={30} className="text-rose-100" />
            <p className="mt-5 text-[9px] font-black uppercase tracking-[.18em] text-rose-100">Critical finding</p>
            <h2 className="mt-1 text-2xl font-black">The series is not stationary.</h2>
            <p className="mt-3 text-sm leading-relaxed text-rose-50">With an ADF p-value of 0.898, the null hypothesis cannot be rejected. The structural level shift visible in 2019 explains why flat statistical forecasts struggle with the later volatility.</p>
            <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-[9px] font-black uppercase tracking-wider text-rose-100">Recommended modeling path</p>
              <p className="mt-2 text-xs font-semibold leading-relaxed">Apply transformation or differencing, validate structural-break features, and compare every candidate on the same rolling holdout windows.</p>
            </div>
          </article>
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-[9px] font-black uppercase tracking-[.18em] text-violet-600">Model progression</p><h2 className="mt-1 text-2xl font-black text-[#0b2853]">From statistical baselines to machine learning</h2></div>
            <p className="max-w-md text-right text-[11px] leading-relaxed text-slate-500">Triple Exponential Smoothing → ARIMA &amp; SARIMA → XGBoost</p>
          </div>

          <div className="mt-4 space-y-5">
            {forecasts.map(({ name, eyebrow, image, alt, width, height, accent, icon: Icon, insight, badge }, index) => (
              <article key={name} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,.12)]">
                <div className={`h-1.5 bg-gradient-to-r ${accent}`} />
                <div className={`grid ${index % 2 ? 'lg:grid-cols-[.72fr_1.65fr]' : 'lg:grid-cols-[1.65fr_.72fr]'}`}>
                  <div className={`relative bg-slate-50 p-3 ${index % 2 ? 'lg:order-2' : ''}`}>
                    <Image src={image} alt={alt} width={width} height={height} className="h-auto w-full rounded-2xl border border-slate-200 bg-white" />
                  </div>
                  <div className="flex flex-col justify-center p-6">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}><Icon size={22} /></div>
                    <p className="mt-5 text-[9px] font-black uppercase tracking-[.18em] text-slate-400">{eyebrow}</p>
                    <h3 className="mt-1 text-xl font-black text-[#0b2853]">{name}</h3>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600">{insight}</p>
                    <span className="mt-5 w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-600">{badge}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_.9fr]">
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,.09)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div><p className="text-[9px] font-black uppercase tracking-[.18em] text-blue-600">Model performance</p><h2 className="mt-1 text-xl font-black text-[#0b2853]">XGBoost generalization check</h2></div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">Train + test</span>
            </div>
            <div className="p-4">
              <Image src="/model-analytics/xgboost-metrics.jpeg" alt="XGBoost training and test MAE, RMSE and MSE metrics" width={832} height={218} className="h-auto w-full rounded-xl border border-slate-100" />
            </div>
          </article>

          <aside className="rounded-3xl bg-gradient-to-br from-[#0b2b59] to-[#081b37] p-5 text-white shadow-[0_18px_50px_rgba(15,23,42,.16)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300/15 text-amber-300"><Lightbulb size={21} /></div>
            <p className="mt-4 text-[9px] font-black uppercase tracking-[.18em] text-amber-300">What the metrics say</p>
            <h2 className="mt-1 text-xl font-black">A measurable generalization gap</h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-300">Test MAE is approximately <strong className="text-white">82% higher</strong> than train MAE, while test MSE is about <strong className="text-white">3.4×</strong> the training value. The model captures signal, but validation discipline remains important.</p>
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-amber-200/15 bg-amber-300/[.07] p-3">
              <ArrowDownRight size={19} className="shrink-0 text-amber-300" />
              <p className="text-[10px] font-semibold leading-relaxed text-amber-100">Next step: time-series cross-validation and feature tuning before production use.</p>
            </div>
          </aside>
        </section>

        <section className="mt-8">
          <div><p className="text-[9px] font-black uppercase tracking-[.18em] text-violet-600">Forecast gallery</p><h2 className="mt-1 text-2xl font-black text-[#0b2853]">Three models, three behaviors</h2><p className="mt-2 text-[11px] text-slate-500">A final side-by-side behavioral summary of the three forecasting approaches.</p></div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {forecasts.map(({ name, eyebrow, accent, icon: Icon, insight, badge }) => (
              <article key={name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,.06)]">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white`}><Icon size={20} /></div>
                <p className="mt-4 text-[8px] font-black uppercase tracking-[.16em] text-slate-400">{eyebrow}</p>
                <h3 className="mt-1 text-lg font-black text-[#0b2853]">{name}</h3>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-600">{insight}</p>
                <span className="mt-4 inline-block rounded-full bg-slate-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-wider text-slate-600">{badge}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-cyan-200/70 bg-gradient-to-r from-cyan-50 via-white to-violet-50 p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0b2853] text-cyan-300"><TrendingUp size={24} /></div><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-cyan-700">Decision takeaway</p><h2 className="mt-1 text-xl font-black text-[#0b2853]">Use forecasts as a range, not a single promise.</h2><p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600">Combine the responsive XGBoost signal with the stable statistical baselines, then translate the spread into inventory scenarios for the Campaign Center.</p></div></div>
            <span className="shrink-0 rounded-full bg-[#0b2853] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white">Model → Campaign → Action</span>
          </div>
        </section>
      </main>
    </div>
  )
}
