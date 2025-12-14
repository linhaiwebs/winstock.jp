import { useState, useEffect } from 'react';
import Header from '../components/Header';
import FluidBackground from '../components/FluidBackground';
import SimplifiedStockInfo from '../components/SimplifiedStockInfo';
import StockPriceTable from '../components/StockPriceTable';
import DiagnosisButton from '../components/DiagnosisButton';
import DiagnosisLoadingOverlay from '../components/DiagnosisLoadingOverlay';
import NewDiagnosisModal from '../components/NewDiagnosisModal';
import ApiStatsDisplay from '../components/ApiStatsDisplay';
import ComplianceNotice from '../components/ComplianceNotice';
import { StockData } from '../types/stock';
import { DiagnosisState } from '../types/diagnosis';
import { useUrlParams } from '../hooks/useUrlParams';
import { apiClient } from '../lib/apiClient';
import { userTracking } from '../lib/userTracking';
import { trackConversion } from '../lib/googleTracking';

export default function NewHome() {
  const urlParams = useUrlParams();
  const [stockCode, setStockCode] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [diagnosisState, setDiagnosisState] = useState<DiagnosisState>('initial');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [diagnosisStartTime, setDiagnosisStartTime] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState<boolean>(false);

  useEffect(() => {
    if (urlParams.code) {
      setStockCode(urlParams.code);
      fetchStockData(urlParams.code);
    }
  }, [urlParams.code]);

  useEffect(() => {
    const trackPageVisit = async () => {
      if (stockData) {
        await userTracking.trackPageLoad({
          stockCode: stockCode,
          stockName: stockData.info.name,
          urlParams: {
            src: urlParams.src || '',
            gclid: urlParams.gclid || '',
            racText: urlParams.racText || '',
            code: urlParams.code || ''
          }
        });
      }
    };

    trackPageVisit();
  }, [stockData, stockCode, urlParams]);

  const fetchStockData = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/api/stock/data?code=${code}`);

      if (!response.ok) {
        throw new Error('株価データの取得に失敗しました');
      }

      const data = await response.json();
      setStockData(data);
      setStockCode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const runDiagnosis = async () => {
    if (diagnosisState !== 'initial' || !stockData) return;

    if (window.gtag) {
      window.gtag('event', 'Bdd');
    }

    setDiagnosisState('connecting');
    setDiagnosisStartTime(Date.now());
    setAnalysisResult('');
    setLoadingProgress(0);
    setShowLoadingOverlay(true);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev < 85) {
          return prev + Math.random() * 15;
        } else if (prev < 95) {
          return prev + Math.random() * 2;
        }
        return prev;
      });
    }, 100);

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/gemini/diagnosis`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: stockCode,
          stockData: {
            name: stockData.info.name,
            price: stockData.info.price,
            change: stockData.info.change,
            changePercent: stockData.info.changePercent,
            per: stockData.info.per,
            pbr: stockData.info.pbr,
            dividend: stockData.info.dividend,
            industry: stockData.info.industry,
            marketCap: stockData.info.marketCap,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('AI診断に失敗しました');
      }

      setDiagnosisState('processing');

      const contentType = response.headers.get('content-type');

      if (contentType?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullAnalysis = '';
        let firstChunk = true;

        if (!reader) {
          throw new Error('ストリーム読み取りに失敗しました');
        }

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                if (parsed.content) {
                  fullAnalysis += parsed.content;

                  if (firstChunk && fullAnalysis.trim().length > 0) {
                    setLoadingProgress(100);
                    setTimeout(() => {
                      setShowLoadingOverlay(false);
                      setDiagnosisState('streaming');
                    }, 600);
                    firstChunk = false;
                  }

                  setAnalysisResult(fullAnalysis);
                }

                if (parsed.done) {
                  setDiagnosisState('results');

                  const durationMs = Date.now() - diagnosisStartTime;
                  await userTracking.trackDiagnosisClick({
                    stockCode: stockCode,
                    stockName: stockData.info.name,
                    durationMs: durationMs
                  });
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      } else {
        const result = await response.json();

        if (!result.analysis || result.analysis.trim() === '') {
          throw new Error('診断結果が生成されませんでした');
        }

        setAnalysisResult(result.analysis);
        setDiagnosisState('results');

        const durationMs = Date.now() - diagnosisStartTime;
        await userTracking.trackDiagnosisClick({
          stockCode: stockCode,
          stockName: stockData.info.name,
          durationMs: durationMs
        });
      }
    } catch (err) {
      console.error('Diagnosis error:', err);
      let errorMessage = '診断中にエラーが発生しました';

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'リクエストがタイムアウトしました';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setDiagnosisState('error');
      setShowLoadingOverlay(false);
      clearInterval(progressInterval);
    }
  };

  const handleLineConversion = async () => {
    try {
      const response = await apiClient.get('/api/line-redirects/select');

      if (!response.ok) {
        console.error('Failed to get LINE redirect link');
        alert('LINEリンクの取得に失敗しました。しばらくしてからもう一度お試しください。');
        return;
      }

      const data = await response.json();

      if (!data.success || !data.link) {
        console.error('No active LINE redirect links available');
        alert('現在利用可能なLINEリンクがありません。');
        return;
      }

      const lineUrl = data.link.redirect_url;
      window.location.href = lineUrl;


      trackConversion();

      await userTracking.trackConversion({
        gclid: urlParams.gclid
      });

      console.log('LINE conversion tracked successfully');
    } catch (error) {
      console.error('LINE conversion error:', error);
      alert('操作に失敗しました。しばらくしてからもう一度お試しください。');
    }
  };

const closeModal = () => {
  setDiagnosisState('initial');
  setAnalysisResult('');
  setLoadingProgress(0);
  setShowLoadingOverlay(false);
  setDiagnosisStartTime(0);
  setError(null);
};

  return (
    <>
      <FluidBackground />

      <div className="relative min-h-screen flex flex-col">
        <Header />
        <ApiStatsDisplay />

        <div className="relative z-10 max-w-[1400px] mx-full px-6 sm:px-8 lg:px-12 py-8 space-y-8 flex-1">
          {error && diagnosisState !== 'error' && (
            <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-red-300 text-center font-semibold">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600/30 border-t-cyan-500"></div>
              <p className="mt-4 text-blue-200 font-medium">株価データを読み込んでいます...</p>
            </div>
          )}

          {stockData && !loading && diagnosisState === 'initial' && (
            <>
              <SimplifiedStockInfo info={stockData.info} />

              <div className="max-w-2xl mx-auto">
                <DiagnosisButton onClick={runDiagnosis} />
              </div>

              <StockPriceTable prices={stockData.prices} />

              <div className="max-w-2xl mx-auto">
                <DiagnosisButton onClick={runDiagnosis} />
              </div>
            </>
          )}

          <DiagnosisLoadingOverlay
            isVisible={showLoadingOverlay}
            progress={loadingProgress}
            onComplete={() => setShowLoadingOverlay(false)}
          />

          {diagnosisState === 'error' && (
            <div className="text-center py-20">
              <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-red-900/40 to-slate-900/40 backdrop-blur-xl border border-red-600/30 rounded-2xl">
                <h3 className="text-xl font-bold text-red-400 mb-4">診断エラー</h3>
                <p className="text-red-300 font-semibold mb-6">{error}</p>
                <button
                  onClick={() => {
                    setDiagnosisState('initial');
                    setError(null);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
                >
                  もう一度試す
                </button>
              </div>
            </div>
          )}

          <NewDiagnosisModal
            isOpen={diagnosisState === 'streaming' || diagnosisState === 'results'}
            onClose={closeModal}
            analysis={analysisResult}
            stockCode={stockCode}
            stockName={stockData?.info.name || ''}
            stockPrice={stockData?.info.price || ''}
            priceChange={`${stockData?.info.change || ''} (${stockData?.info.changePercent || ''})`}
            onLineConversion={handleLineConversion}
            isStreaming={diagnosisState === 'streaming'}
            isConnecting={diagnosisState === 'connecting'}
          />
        </div>

        <ComplianceNotice />
      </div>
    </>
  );
}
