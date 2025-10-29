import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Difference {
  id: number;
  x: number;
  y: number;
  found: boolean;
}

interface Level {
  id: number;
  image1: string;
  image2: string;
  differences: Omit<Difference, 'found'>[];
  difficulty: 'easy' | 'medium' | 'hard';
}

const levels: Level[] = [
  {
    id: 1,
    image1: 'https://cdn.poehali.dev/projects/07cf2143-2ce8-428a-b69f-5edaaa4c665c/files/94e1b305-f1cc-4823-b210-f58ea57ef29b.jpg',
    image2: 'https://cdn.poehali.dev/projects/07cf2143-2ce8-428a-b69f-5edaaa4c665c/files/5f915e2b-7670-4cc8-bca6-59f1c2609853.jpg',
    differences: [
      { id: 1, x: 30, y: 25 },
      { id: 2, x: 65, y: 40 },
      { id: 3, x: 50, y: 70 },
    ],
    difficulty: 'easy',
  },
];

const Index = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [differences, setDifferences] = useState<Difference[]>([]);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [stars, setStars] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const level = levels[currentLevel];
  const foundCount = differences.filter(d => d.found).length;
  const totalCount = differences.length;
  const progress = (foundCount / totalCount) * 100;

  useEffect(() => {
    if (level) {
      setDifferences(level.differences.map(d => ({ ...d, found: false })));
      setTimer(0);
      setIsPlaying(true);
    }
  }, [currentLevel]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (foundCount === totalCount && totalCount > 0) {
      setIsPlaying(false);
      setShowConfetti(true);
      const earnedStars = timer < 30 ? 3 : timer < 60 ? 2 : 1;
      setStars(prev => prev + earnedStars);
      toast.success(`🎉 Уровень пройден! +${earnedStars} ⭐`, {
        description: `Время: ${timer} секунд`,
      });
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [foundCount, totalCount]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, imageIndex: number) => {
    if (!isPlaying) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clickedDiff = differences.find(
      d => !d.found && Math.abs(d.x - x) < 8 && Math.abs(d.y - y) < 8
    );

    if (clickedDiff) {
      setDifferences(prev =>
        prev.map(d => (d.id === clickedDiff.id ? { ...d, found: true } : d))
      );
      toast.success('✨ Отличие найдено!');
    } else {
      toast.error('❌ Тут нет отличия');
    }
  };

  const useHint = () => {
    if (hintsLeft <= 0) {
      toast.error('Подсказки закончились!');
      return;
    }

    const unfound = differences.find(d => !d.found);
    if (unfound) {
      setHintsLeft(prev => prev - 1);
      toast.info('💡 Смотри на мигающую область!');
    }
  };

  const resetLevel = () => {
    setDifferences(level.differences.map(d => ({ ...d, found: false })));
    setTimer(0);
    setIsPlaying(true);
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(prev => prev + 1);
    } else {
      toast.success('🎊 Все уровни пройдены!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-yellow-50 to-pink-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-purple-600 mb-2 drop-shadow-lg">
            🔍 Найди отличия!
          </h1>
          <p className="text-xl text-purple-800">Найди все отличия на картинках</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white/90 backdrop-blur shadow-xl border-4 border-purple-200">
            <div className="flex items-center gap-3">
              <Icon name="Star" className="text-yellow-500" size={32} />
              <div>
                <p className="text-sm text-gray-600">Звёзды</p>
                <p className="text-3xl font-bold text-purple-600">{stars}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/90 backdrop-blur shadow-xl border-4 border-yellow-200">
            <div className="flex items-center gap-3">
              <Icon name="Clock" className="text-orange-500" size={32} />
              <div>
                <p className="text-sm text-gray-600">Время</p>
                <p className="text-3xl font-bold text-purple-600">{formatTime(timer)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/90 backdrop-blur shadow-xl border-4 border-pink-200">
            <div className="flex items-center gap-3">
              <Icon name="Search" className="text-pink-500" size={32} />
              <div>
                <p className="text-sm text-gray-600">Найдено</p>
                <p className="text-3xl font-bold text-purple-600">
                  {foundCount}/{totalCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/90 backdrop-blur shadow-xl border-4 border-green-200">
            <div className="flex items-center gap-3">
              <Icon name="Lightbulb" className="text-green-500" size={32} />
              <div>
                <p className="text-sm text-gray-600">Подсказки</p>
                <p className="text-3xl font-bold text-purple-600">{hintsLeft}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-white/90 backdrop-blur shadow-xl border-4 border-purple-300 mb-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-purple-700">
                Уровень {level.id}
              </span>
              <span className="px-4 py-1 bg-purple-500 text-white rounded-full text-sm font-semibold uppercase">
                {level.difficulty === 'easy' ? '🟢 Легко' : level.difficulty === 'medium' ? '🟡 Средне' : '🔴 Сложно'}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="relative group">
              <div
                className="relative rounded-2xl overflow-hidden border-4 border-purple-300 shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={(e) => handleImageClick(e, 1)}
              >
                <img
                  src={level.image1}
                  alt="Картинка 1"
                  className="w-full h-auto"
                />
                {differences
                  .filter(d => d.found)
                  .map(d => (
                    <div
                      key={d.id}
                      className="absolute w-12 h-12 border-4 border-green-500 rounded-full animate-bounce-in"
                      style={{
                        left: `${d.x}%`,
                        top: `${d.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">✓</span>
                      </div>
                    </div>
                  ))}
              </div>
              <p className="text-center mt-2 text-purple-700 font-semibold">Картинка 1</p>
            </div>

            <div className="relative group">
              <div
                className="relative rounded-2xl overflow-hidden border-4 border-purple-300 shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={(e) => handleImageClick(e, 2)}
              >
                <img
                  src={level.image2}
                  alt="Картинка 2"
                  className="w-full h-auto"
                />
                {differences
                  .filter(d => d.found)
                  .map(d => (
                    <div
                      key={d.id}
                      className="absolute w-12 h-12 border-4 border-green-500 rounded-full animate-bounce-in"
                      style={{
                        left: `${d.x}%`,
                        top: `${d.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">✓</span>
                      </div>
                    </div>
                  ))}
              </div>
              <p className="text-center mt-2 text-purple-700 font-semibold">Картинка 2</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={useHint}
              disabled={hintsLeft <= 0 || !isPlaying}
              className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-6 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              <Icon name="Lightbulb" className="mr-2" size={24} />
              Подсказка ({hintsLeft})
            </Button>

            <Button
              onClick={resetLevel}
              className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-6 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Icon name="RotateCcw" className="mr-2" size={24} />
              Начать заново
            </Button>

            {foundCount === totalCount && (
              <Button
                onClick={nextLevel}
                className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-6 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all animate-bounce-in"
              >
                <Icon name="ArrowRight" className="mr-2" size={24} />
                Следующий уровень
              </Button>
            )}
          </div>
        </Card>

        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute text-4xl animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              >
                {['🎉', '⭐', '🎊', '✨', '🌟'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
