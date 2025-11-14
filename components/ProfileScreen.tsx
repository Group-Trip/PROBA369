import { FiArrowLeft, FiTag, FiGift, FiTrendingUp, FiSettings, FiLogOut, FiAward, FiCalendar, FiShield, FiShare2 } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { auth } from "../lib/auth";
import { api } from "../lib/api";
import { attractions } from "../lib/attractions";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner";

interface ProfileScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

// FIXED: ProfileScreen rebuild 2024-11-13 v3
export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  // Fixed: Removed handleSettingsClick - Build 2024-11-13
  const [bookings, setBookings] = useState<any[]>([]);
  const [createdGroups, setCreatedGroups] = useState<any[]>([]);
  const [allUserGroups, setAllUserGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const user = auth.getCurrentUser();

  // Auto-scroll to top when profile screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const [bookingsData, groupsData, allGroupsData] = await Promise.all([
        api.getUserBookings(),
        api.getUserGroups(),
        api.getAllUserGroups()
      ]);
      setBookings(bookingsData.bookings || []);
      setCreatedGroups(groupsData.groups || []);
      setAllUserGroups(allGroupsData.groups || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      onNavigate("auth");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpgradeToStaff = async () => {
    try {
      setIsUpgrading(true);
      const token = localStorage.getItem('access_token') || publicAnonKey;
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-72f8f261/upgrade-claudia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade to staff');
      }

      alert('✅ ' + data.message);
      
      // Reload the page to refresh user data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error upgrading to staff:', error);
      alert('❌ Błąd: ' + (error.message || 'Nie udało się uzyskać uprawnień pracownika'));
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleShareGroup = async (group: any) => {
    const attraction = attractions.find(a => a.id === group.attractionId);
    if (!attraction) return;

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr + 'T12:00:00');
      const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
                      'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    try {
      const shareUrl = `${window.location.origin}/join/${group.id}`;
      const spotsLeft = group.numberOfPeople - group.currentMembers;
      const shareText = `Hej! Dołącz do mojej grupy na ${attraction.name}!\n🎿 Data: ${formatDate(group.date)} o ${group.time}\n💰 Cena: ${attraction.groupPrice} zł (zamiast ${attraction.regularPrice} zł - ${Math.round((1 - attraction.groupPrice / attraction.regularPrice) * 100)}% taniej!)\n👥 Zostało ${spotsLeft > 0 ? spotsLeft : 0} ${spotsLeft === 1 ? 'miejsce' : spotsLeft <= 4 ? 'miejsca' : 'miejsc'}\n\n`;
      const fullText = shareText + shareUrl;
      
      console.log('📤 Sharing group:', { 
        groupId: group.id,
        shareUrl, 
        shareText,
        origin: window.location.origin 
      });

      // Try native share first (works on mobile)
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Dołącz do grupy - ${attraction.name}`,
            text: shareText,
            url: shareUrl,
          });
          toast.success("Link udostępniony!");
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            return; // User cancelled
          }
          console.log('Native share cancelled or failed, falling back to copy');
        }
      }

      // Use old-school method that always works
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          console.log('✅ Copied to clipboard:', fullText);
          toast.success("Link skopiowany! 🎉", {
            description: "Wyślij znajomym aby dołączyli do grupy!"
          });
        } else {
          throw new Error('execCommand returned false');
        }
      } catch (err) {
        console.error('Copy failed:', err);
        toast.error("Nie udało się skopiować linku");
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('❌ Unexpected error in handleShareGroup:', error);
      toast.error("Wystąpił błąd: " + (error as Error).message);
    }
  };

  const totalSaved = bookings.reduce((sum, booking) => {
    const attraction = attractions.find(a => a.id === booking.attractionId);
    if (attraction) {
      return sum + ((attraction.regularPrice - attraction.groupPrice) * booking.numberOfTickets);
    }
    return sum;
  }, 0);

  const tripsCompleted = bookings.length;
  const groupsOrganized = createdGroups.length;

  console.log('🔍 ProfileScreen DEBUG:', {
    allUserGroups: allUserGroups.length,
    isLoading,
    groups: allUserGroups
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-turquoise-500 text-white p-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => onNavigate("welcome")}
          >
            <FiArrowLeft size={24} />
          </Button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24 mb-3 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-white text-blue-600 text-2xl">
              {user?.user_metadata?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'GU'}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-white mb-1">{user?.user_metadata?.name || 'Użytkownik'}</h2>
          <p className="text-white/80">{user?.email}</p>
        </div>
      </div>

      <div className="px-4 -mt-16 space-y-4 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center">
              <FiTrendingUp className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-gray-900 mb-1">{totalSaved} zł</p>
              <p className="text-xs text-gray-500">Oszczędzone</p>
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center">
              <FiTag className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-gray-900 mb-1">{tripsCompleted}</p>
              <p className="text-xs text-gray-500">Wycieczki</p>
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="flex flex-col items-center">
              <FiAward className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-gray-900 mb-1">{groupsOrganized}</p>
              <p className="text-xs text-gray-500">Zorganizowane</p>
            </div>
          </Card>
        </div>

        {/* Rewards Card */}
        <Card className="p-5 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiGift className="w-6 h-6" />
              <h3 className="text-white">Nagrody</h3>
            </div>
            <Badge className="bg-white text-purple-600">Poziom 2</Badge>
          </div>
          <p className="text-white/90 text-sm mb-3">
            Zdobyłeś 320 punktów! Jeszcze 80 do odblokowania poziomu 3.
          </p>
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div className="bg-white h-full" style={{ width: '80%' }} />
          </div>
        </Card>

        {/* User Groups */}
        <div>
          <h3 className="mb-3 px-1">Twoje grupy</h3>
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Ładowanie...</p>
            </Card>
          ) : allUserGroups.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-2">Brak grup</p>
              <p className="text-sm text-gray-500">Dołącz do grupy lub utwórz swoją!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {allUserGroups.map((group) => {
                const attraction = attractions.find(a => a.id === group.attractionId);
                if (!attraction) return null;
                
                const formatDate = (dateStr: string) => {
                  const date = new Date(dateStr + 'T12:00:00');
                  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
                };

                const isOrganizer = group.organizerId === user?.id;
                const myMember = group.members.find((m: any) => m.userId === user?.id);
                const myTicketsCount = myMember?.numberOfTickets || 0;

                // Check if tickets were sent
                const ticketsSent = group.ticketsSentAt != null;

                return (
                  <Card key={group.id} className="overflow-hidden">
                    <div className="flex gap-3 p-3">
                      <ImageWithFallback
                        src={attraction.image}
                        alt={attraction.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div className="pr-2">
                            <p>{attraction.name}</p>
                            <p className="text-sm text-gray-500">{attraction.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <FiCalendar className="w-3 h-3 text-gray-400" />
                          <p className="text-sm text-gray-500">{formatDate(group.date)} · {group.time}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {isOrganizer && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                              👑 Organizator
                            </Badge>
                          )}
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                            {myTicketsCount} {myTicketsCount === 1 ? 'miejsce' : myTicketsCount <= 4 ? 'miejsca' : 'miejsc'}
                          </Badge>
                          {ticketsSent ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              ✅ Bilety wysłane
                            </Badge>
                          ) : group.status === 'full' ? (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                              📞 Weryfikacja z obiektem
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                              ⏳ {group.currentMembers}/{group.numberOfPeople}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareGroup(group);
                            }}
                          >
                            <FiShare2 className="w-4 h-4 mr-2" />
                            Skopiuj link do grupy
                          </Button>
                          {ticketsSent && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate('tickets', { groupId: group.id });
                              }}
                            >
                              Zobacz bilety
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Achievements */}
        <Card className="p-5">
          <h3 className="mb-4">Osiągnięcia</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-3xl mb-1">🎯</div>
              <p className="text-xs text-gray-600">Pierwsza wycieczka</p>
            </div>
            <div>
              <div className="text-3xl mb-1">👥</div>
              <p className="text-xs text-gray-600">Gwiazda grup</p>
            </div>
            <div>
              <div className="text-3xl mb-1">💰</div>
              <p className="text-xs text-gray-600">Mistrz oszczędzania</p>
            </div>
            <div className="opacity-40">
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-xs text-gray-600">Legenda</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={() => onNavigate("tickets")}
          >
            <FiTag className="w-5 h-5 mr-3" />
            Wszystkie moje bilety
          </Button>
          
          {/* Staff Panel - Only visible for staff users */}
          {auth.isStaff() && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-purple-200 bg-purple-50 hover:bg-purple-100"
                onClick={() => onNavigate("admin")}
              >
                <FiShield className="w-5 h-5 mr-3 text-purple-600" />
                <span className="text-purple-700">Panel Pracownika</span>
              </Button>
            </>
          )}

          {/* Upgrade button - only for claudia.wolna@op.pl who isn't staff yet */}
          {!auth.isStaff() && user?.email?.toLowerCase() === 'claudia.wolna@op.pl' && (
            <>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start h-12 border-green-200 bg-green-50 hover:bg-green-100"
                onClick={handleUpgradeToStaff}
                disabled={isUpgrading}
              >
                <FiShield className="w-5 h-5 mr-3 text-green-600" />
                <span className="text-green-700">
                  {isUpgrading ? 'Aktualizacja konta...' : '🔑 Aktywuj uprawnienia pracownika'}
                </span>
              </Button>
            </>
          )}
          
          <Separator />
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <FiLogOut className="w-5 h-5 mr-3" />
            Wyloguj się
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

📄 PLIK 2: `/components/PublicGroupPreview.tsx`
CAŁY KOD - SKOPIUJ I WKLEJ:

```tsx
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
