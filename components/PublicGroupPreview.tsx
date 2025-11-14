import { FiUsers, FiCalendar, FiClock, FiMapPin, FiTrendingDown, FiArrowRight } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { attractions } from "../lib/attractions";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api } from "../lib/api";

interface PublicGroupPreviewProps {
  groupId: string;
  onJoinClick: (groupId: string) => void;
}

export function PublicGroupPreview({ groupId, onJoinClick }: PublicGroupPreviewProps) {
  const [group, setGroup] = useState<any>(null);
  const [attraction, setAttraction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setIsLoading(true);
      console.log('🔗 Public preview - fetching group:', groupId);
      const response = await api.getGroup(groupId);
      
      if (response.group) {
        const groupData = response.group;
        setGroup(groupData);
        
        const attr = attractions.find(a => a.id === groupData.attractionId);
        if (attr) {
          setAttraction(attr);
        }
        console.log('✅ Group loaded for public preview:', groupData);
      }
    } catch (err: any) {
      console.error('Error fetching group:', err);
      setError("Nie udało się załadować szczegółów grupy");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
                    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie szczegółów grupy...</p>
        </div>
      </div>
    );
  }

  if (error || !group || !attraction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-gray-900 mb-2">Grupa nie została znaleziona</h2>
          <p className="text-gray-600 mb-4">
            {error || "Sprawdź czy link jest poprawny"}
          </p>
        </Card>
      </div>
    );
  }

  const spotsLeft = group.numberOfPeople - group.currentMembers;
  const discount = Math.round((1 - attraction.groupPrice / attraction.regularPrice) * 100);
  const isFull = spotsLeft <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={attraction.image}
          alt={attraction.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 mb-2">
            {attraction.category}
          </Badge>
          <h1 className="text-white mb-1">{attraction.name}</h1>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <FiMapPin className="w-4 h-4" />
            <span>{attraction.location}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Invitation Message */}
        <Card className="p-5 bg-gradient-to-r from-blue-500 to-turquoise-500 text-white">
          <div className="flex items-start gap-3">
            <div className="text-4xl">👋</div>
            <div>
              <p className="text-white mb-1">Zaproszenie do grupy</p>
              <p className="text-white/90 text-sm">
                <span className="font-semibold">{group.organizerName}</span> zaprasza Cię do wspólnego wyjazdu!
              </p>
            </div>
          </div>
        </Card>

        {/* Date & Time */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Termin wyjazdu</p>
              <p className="text-gray-900">{formatDate(group.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <FiClock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Godzina</p>
              <p className="text-gray-900">{group.time}</p>
            </div>
          </div>
        </Card>

        {/* Price & Discount */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Cena grupowa</p>
              <div className="flex items-baseline gap-2">
                <span className="text-gray-900 text-2xl">{attraction.groupPrice} zł</span>
                <span className="text-gray-400 line-through text-sm">{attraction.regularPrice} zł</span>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 border-0 text-lg px-4 py-2">
              <FiTrendingDown className="w-4 h-4 mr-1 inline" />
              -{discount}%
            </Badge>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-sm text-green-700">
              💰 Oszczędzasz <span className="font-semibold">{attraction.regularPrice - attraction.groupPrice} zł</span> na bilecie!
            </p>
          </div>
        </Card>

        {/* Group Status */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-turquoise-100 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-turquoise-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Status grupy</p>
              <p className="text-gray-900">
                {group.currentMembers} / {group.numberOfPeople} osób
              </p>
            </div>
            {!isFull && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {spotsLeft} {spotsLeft === 1 ? 'miejsce' : spotsLeft <= 4 ? 'miejsca' : 'miejsc'}
              </Badge>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-turquoise-500 h-full transition-all duration-300"
              style={{ width: `${Math.min((group.currentMembers / group.numberOfPeople) * 100, 100)}%` }}
            />
          </div>
          
          {isFull ? (
            <p className="text-sm text-orange-600">
              ⏳ Grupa pełna - trwa weryfikacja z obiektem
            </p>
          ) : spotsLeft <= 3 ? (
            <p className="text-sm text-orange-600">
              🔥 Ostatnie miejsca! Dołącz szybko!
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Grupa wymaga minimum 15 osób
            </p>
          )}
        </Card>

        {/* Benefits */}
        <Card className="p-5">
          <h3 className="mb-3">Dlaczego warto dołączyć?</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">💰</span>
              </div>
              <p className="text-sm text-gray-600">
                Niższa cena dzięki rabatowi grupowemu
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">👥</span>
              </div>
              <p className="text-sm text-gray-600">
                Poznaj nowych ludzi o podobnych zainteresowaniach
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎫</span>
              </div>
              <p className="text-sm text-gray-600">
                Bilety wysłane e-mailem po zebraniu grupy
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto p-4">
          {isFull ? (
            <Button 
              size="lg" 
              className="w-full bg-gray-400 cursor-not-allowed" 
              disabled
            >
              Grupa pełna
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-blue-500 to-turquoise-500 text-white"
              onClick={() => onJoinClick(groupId)}
            >
              Dołącz do grupy
              <FiArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
          <p className="text-xs text-gray-500 text-center mt-2">
            Zaloguj się lub zarejestruj, aby dołączyć
          </p>
        </div>
      </div>
    </div>
  );
}
