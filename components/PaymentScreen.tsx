import { FiArrowLeft as ArrowLeft, FiUsers, FiCalendar as Calendar, FiClock as Clock, FiMapPin, FiTrendingDown as TrendingDown } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { attractions } from "../lib/attractions";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api } from "../lib/api";

interface JoinGroupScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  initialGroupId?: string;
}

interface Group {
  id: string;
  attractionId: number;
  attractionName: string;
  location: string;
  category: string;
  date: string;
  time: string;
  currentMembers: number;
  numberOfPeople: number;
  organizerName: string;
  groupPrice: number;
  regularPrice: number;
}

export function JoinGroupScreen({ onNavigate, initialGroupId }: JoinGroupScreenProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Auto-scroll to top when join group screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeepLinkGroup = async (groupId: string) => {
    try {
      console.log('🔗 Deep link - fetching group:', groupId);
      const response = await api.getGroup(groupId);
      if (response.group) {
        const group = response.group;
        const attraction = attractions.find(a => a.id === group.attractionId);
        if (attraction) {
          console.log('✅ Deep link - navigating to group details');
          onNavigate("group-details", {
            ...attraction,
            ...group,
            groupId: group.id,
            attractionId: group.attractionId,
            isOrganizer: false
          });
        }
      }
    } catch (err) {
      console.error('Deep link error:', err);
      // If group not found, just show all groups
    }
  };

  useEffect(() => {
    fetchGroups();
    
    // If initialGroupId is provided (from deep link), auto-navigate to that group
    if (initialGroupId) {
      handleDeepLinkGroup(initialGroupId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await api.getGroups();
      const fetchedGroups = response.groups || [];
      console.log(`📋 Fetched ${fetchedGroups.length} groups in JoinGroupScreen:`, fetchedGroups.map((g: Group) => ({
        id: g.id,
        attractionName: g.attractionName,
        currentMembers: g.currentMembers,
        numberOfPeople: g.numberOfPeople
      })));
      setGroups(fetchedGroups);
    } catch (err: any) {
      console.error('Fetch groups error:', err);
      setError(err.message || "Błąd ładowania grup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = (group: Group) => {
    const attraction = attractions.find(a => a.id === group.attractionId);
    if (attraction) {
      console.log('📍 Navigating to group details:', {
        groupId: group.id,
        attractionId: group.attractionId,
        currentMembers: group.currentMembers,
        numberOfPeople: group.numberOfPeople,
        status: group.status
      });
      onNavigate("group-details", {
        ...attraction,
        ...group,
        groupId: group.id,        // Explicitly set groupId
        attractionId: group.attractionId,  // Keep original attraction ID
        isOrganizer: false
      });
    }
  };

  const formatDate = (dateStr: string) => {
    // Parse date in local timezone by adding time component
    const date = new Date(dateStr + 'T12:00:00');
    const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 
                    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const renderGroupCard = (group: Group, badgeColor?: string, badgeText?: string) => {
    const attraction = attractions.find(a => a.id === group.attractionId);
    if (!attraction) return null;
    
    const minPeople = group.minPeople || 15;
    const spotsLeft = Math.max(0, minPeople - group.currentMembers);
    const progress = (group.currentMembers / minPeople) * 100;

    return (
      <Card 
        key={group.id} 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleJoinGroup(group)}
      >
        <div className="relative">
          <ImageWithFallback
            src={attraction.image}
            alt={attraction.name}
            className="w-full h-32 object-cover"
          />
          <Badge className={badgeColor || "absolute top-2 right-2 bg-white text-blue-600"}>
            {badgeText || (spotsLeft > 0 
              ? `${spotsLeft} ${spotsLeft === 1 ? 'miejsce' : spotsLeft <= 4 ? 'miejsca' : 'miejsc'}` 
              : 'Kompletna!')
            }
          </Badge>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="mb-1">{attraction.name}</h3>
              <p className="text-sm text-gray-600">{attraction.location}</p>
              <p className="text-xs text-blue-600 mt-1">{attraction.ticketType}</p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="flex gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(group.date)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{group.time}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Postęp grupy</span>
              <span className="text-blue-600">
                {group.currentMembers}/{minPeople}
                {group.currentMembers > minPeople && ` (+${group.currentMembers - minPeople})`}
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all ${badgeColor?.includes('orange') ? 'bg-orange-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Savings and Organizer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-green-600 text-sm">
                Oszczędzasz {attraction.regularPrice - attraction.groupPrice} zł
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Org: {group.organizerName}
            </Badge>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-turquoise-500 text-white p-6 pb-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => onNavigate("welcome")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="ml-4">Dołącz do Grupy</h2>
        </div>
        <p className="text-white/90">Znajdź grupę i zaoszczędź na bilecie</p>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">Ładowanie dostępnych grup...</p>
          </Card>
        ) : groups.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-2">Brak dostępnych grup</p>
            <p className="text-sm text-gray-500">Utwórz pierwszą grupę i zaproś znajomych!</p>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all">Wszystkie</TabsTrigger>
              <TabsTrigger value="soon">Wkrótce</TabsTrigger>
              <TabsTrigger value="filling">Zapełniają się</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              {groups.map((group) => renderGroupCard(group))}
            </TabsContent>

            <TabsContent value="soon" className="space-y-3 mt-4">
              {groups
                .filter(g => {
                  const date = new Date(g.date + 'T12:00:00');
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const diff = date.getTime() - today.getTime();
                  const days = diff / (1000 * 60 * 60 * 24);
                  // Show only groups from TOMORROW onwards (days >= 1), not today
                  return days <= 7 && days >= 1;
                })
                .map((group) => renderGroupCard(group))}
            </TabsContent>

            <TabsContent value="filling" className="space-y-3 mt-4">
              {groups
                .filter(g => (g.currentMembers / g.numberOfPeople) >= 0.6)
                .map((group) => renderGroupCard(
                  group, 
                  "absolute top-2 right-2 bg-orange-500 text-white",
                  "Prawie pełna!"
                ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
```

---

✅ PLIK 2: `/components/PaymentScreen.tsx`

```tsx
import { FiArrowLeft as ArrowLeft, FiCreditCard, FiLock, FiCheckCircle, FiGift, FiUsers, FiPlus, FiMinus } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { api } from "../lib/api";

interface PaymentScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  attraction: any;
}

interface TicketHolder {
  name: string;
  isChild: boolean;
}

export function PaymentScreen({ onNavigate, attraction }: PaymentScreenProps) {
  // Ref do pierwszego inputa w formularzu karty
  const cardholderInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll do formularza płatności gdy ekran się załaduje
  useEffect(() => {
    // Multi-step scroll - najpierw na dół, potem do inputa
    const timer1 = setTimeout(() => {
      // Krok 1: Przewiń na sam dół strony
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'instant' // natychmiast bez animacji
      });
    }, 100);
    
    const timer2 = setTimeout(() => {
      // Krok 2: Przewiń trochę w górę do inputa karty
      if (cardholderInputRef.current) {
        const elementPosition = cardholderInputRef.current.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 100;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Focus z opóźnieniem
        setTimeout(() => {
          cardholderInputRef.current?.focus();
        }, 400);
      }
    }, 400);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  console.log('💳 PaymentScreen loaded:', {
    groupId: attraction.groupId,
    attractionId: attraction.id,
    isOrganizer: attraction.isOrganizer
  });
  
  // Jeśli organizator tworzy grupę i ma już dane uczestników, użyj ich
  const isOrganizerWithData = attraction.isOrganizer && attraction.members?.[0]?.ticketHolders?.length > 0;
  const initialTickets = isOrganizerWithData 
    ? attraction.members[0].ticketHolders.length 
    : (attraction.isOrganizer && attraction.currentMembers ? attraction.currentMembers : 1);
  
  const initialHolders = isOrganizerWithData
    ? attraction.members[0].ticketHolders
    : Array.from({ length: initialTickets }, () => ({ name: "", isChild: false }));

  const [numberOfTickets, setNumberOfTickets] = useState(initialTickets);
  const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>(initialHolders);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleTicketCountChange = (newCount: number) => {
    if (newCount < 1 || newCount > 10) return;
    
    setNumberOfTickets(newCount);
    
    // Adjust ticket holders array
    if (newCount > ticketHolders.length) {
      const newHolders = [...ticketHolders];
      for (let i = ticketHolders.length; i < newCount; i++) {
        newHolders.push({ name: "", isChild: false });
      }
      setTicketHolders(newHolders);
    } else {
      setTicketHolders(ticketHolders.slice(0, newCount));
    }
  };

  const updateTicketHolder = (index: number, field: 'name' | 'isChild', value: string | boolean) => {
    const newHolders = [...ticketHolders];
    if (field === 'name') {
      newHolders[index].name = value as string;
    } else {
      newHolders[index].isChild = value as boolean;
    }
    setTicketHolders(newHolders);
  };

  const ticketsTotal = attraction.groupPrice * numberOfTickets;
  const total = ticketsTotal;

  const handlePayment = async () => {
    setIsProcessing(true);
    setError("");

    try {
      let updatedGroupData = null;
      
      // First, join the group if it's not the user's own group
      if (!attraction.isOrganizer && attraction.groupId) {
        const joinResponse = await api.joinGroup(attraction.groupId, {
          numberOfTickets,
          ticketHolders
        });
        
        // Get updated group data from the join response
        if (joinResponse.group) {
          updatedGroupData = joinResponse.group;
          console.log('✅ Joined group successfully:', {
            groupId: updatedGroupData.id,
            currentMembers: updatedGroupData.currentMembers,
            numberOfPeople: updatedGroupData.numberOfPeople,
            status: updatedGroupData.status
          });
        }
      }

      // Create booking
      const bookingResponse = await api.createBooking({
        groupId: attraction.groupId || null,
        attractionId: attraction.id,
        attractionName: attraction.name,
        numberOfTickets,
        ticketHolders,
        totalPaid: total,
        date: attraction.date,
        time: attraction.time
      });

      if (bookingResponse.success) {
        onNavigate("confirmation", { 
          ...attraction,
          // Override with updated group data if available
          ...(updatedGroupData && {
            currentMembers: updatedGroupData.currentMembers,
            status: updatedGroupData.status,
            members: updatedGroupData.members
          }),
          numberOfTickets,
          ticketHolders,
          totalPaid: total,
          bookingId: bookingResponse.booking.id
        });
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || "Błąd podczas przetwarzania płatności. Spróbuj ponownie.");
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = ticketHolders.every(holder => holder.name.trim() !== "") && 
                      cardholderName.trim() !== "" &&
                      cardNumber.length > 0 &&
                      !isProcessing;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-turquoise-500 text-white p-6">
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => onNavigate("group-details", attraction)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="ml-4">Płatność</h2>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        {/* Number of Tickets */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiUsers className="w-5 h-5 text-blue-600" />
                <h3>Liczba biletów</h3>
              </div>
              <p className="text-sm text-gray-600">{attraction.ticketType}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleTicketCountChange(numberOfTickets - 1)}
                disabled={numberOfTickets <= 1}
              >
                <FiMinus size={16} />
              </Button>
              <span className="flex-1 text-center">{numberOfTickets}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleTicketCountChange(numberOfTickets + 1)}
                disabled={numberOfTickets >= 10}
                className="w-8 h-8 p-0"
              >
                <FiPlus size={16} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Ticket Holders Information */}
        <Card className="p-5">
          <h3 className="mb-4">Dane uczestników</h3>
          <div className="space-y-4">
            {ticketHolders.map((holder, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <p className="text-sm text-gray-600">Bilet #{index + 1}</p>
                <div>
                  <Label htmlFor={`holder-name-${index}`}>Imię i nazwisko</Label>
                  <Input
                    id={`holder-name-${index}`}
                    placeholder="Jan Kowalski"
                    value={holder.name}
                    onChange={(e) => updateTicketHolder(index, 'name', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`child-${index}`}
                    checked={holder.isChild}
                    onCheckedChange={(checked) => updateTicketHolder(index, 'isChild', checked as boolean)}
                  />
                  <label
                    htmlFor={`child-${index}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Dziecko
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-5">
          <h3 className="mb-4">Podsumowanie zamówienia</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{attraction.name}</span>
              <span>{numberOfTickets} {numberOfTickets === 1 ? 'bilet' : 'bilety'}</span>
            </div>
            {ticketHolders.map((holder, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {holder.name || `Uczestnik ${index + 1}`} {holder.isChild && '(Dziecko)'}
                </span>
                <span className="text-gray-600">
                  {attraction.groupPrice} zł
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between">
              <span>Razem do zapłaty</span>
              <span className="text-blue-600">{total} zł</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Oszczędność na grupie</span>
              <span className="text-green-600">
                -{(attraction.regularPrice - attraction.groupPrice) * numberOfTickets} zł
              </span>
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiCreditCard className="w-5 h-5 text-blue-600" />
            <h3>Metoda płatności</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="cardholder-name">Imię i nazwisko posiadacza karty</Label>
              <Input
                ref={cardholderInputRef}
                id="cardholder-name"
                placeholder="Jan Kowalski"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="card">Numer karty</Label>
              <Input
                id="card"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Data ważności</Label>
                <Input
                  id="expiry"
                  placeholder="MM/RR"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  maxLength={5}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Security Notice */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <FiLock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-900 mb-1">Bezpieczna płatność</p>
              <p className="text-sm text-blue-700">
                Twoje dane są szyfrowane i bezpieczne. Nie przechowujemy danych karty.
              </p>
            </div>
          </div>
        </Card>

        {/* Benefits List */}
        <Card className="p-4 bg-amber-50 border-amber-200">
          <p className="mb-3 text-amber-900">📬 Jak otrzymam bilety?</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <FiCheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Po płatności otrzymasz potwierdzenie rezerwacji
              </p>
            </div>
            <div className="flex items-start gap-2">
              <FiCheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Bilety otrzymasz na email i SMS po zapełnieniu grupy
              </p>
            </div>
            <div className="flex items-start gap-2">
              <FiCheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Gwarancja zwrotu jeśli grupa się nie zapełni
              </p>
            </div>
            <div className="flex items-start gap-2">
              <FiCheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <p className="text-sm text-green-800">
                Bilety cyfrowe z kodami QR na e-mail
              </p>
            </div>
          </div>
        </Card>

        {/* Pay Button */}
        <Button
          onClick={handlePayment}
          disabled={!canProceed}
          className="w-full bg-gradient-to-r from-blue-600 to-turquoise-600 text-white h-14 shadow-lg disabled:opacity-50"
        >
          {isProcessing ? "Przetwarzanie..." : `Zapłać ${total.toFixed(2)} zł`}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Kontynuując, akceptujesz nasz Regulamin i Politykę Prywatności
        </p>
      </div>
    </div>
  );
}
