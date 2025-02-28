import { useState, useEffect, useRef } from 'react';
import { FaRegFolderClosed } from 'react-icons/fa6';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ChatHistory = {
  messages: Message[];
  input: string;
};

// Customize these placeholder messages for the input field
const PLACEHOLDER_MESSAGES = [
  'Escribeme tus preguntas...',
  '¿Cuantos años tienes?',
  '¿Cuales son tus skills?',
  '¿Donde estas ubicado?',
  '¿Que proyectos has realizado?',
];

export default function MacTerminal() {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({
    messages: [],
    input: '',
  });
  const [isTyping, setIsTyping] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentMessage = PLACEHOLDER_MESSAGES[currentPlaceholderIndex];

    const animatePlaceholder = () => {
      if (isDeleting) {
        if (placeholder.length === 0) {
          setIsDeleting(false);
          setCurrentPlaceholderIndex(
            (prev) => (prev + 1) % PLACEHOLDER_MESSAGES.length
          );
          timeout = setTimeout(animatePlaceholder, 400);
        } else {
          setPlaceholder((prev) => prev.slice(0, -1));
          timeout = setTimeout(animatePlaceholder, 80);
        }
      } else {
        if (placeholder.length === currentMessage.length) {
          timeout = setTimeout(() => setIsDeleting(true), 1500);
        } else {
          setPlaceholder(currentMessage.slice(0, placeholder.length + 1));
          timeout = setTimeout(animatePlaceholder, 120);
        }
      }
    };

    timeout = setTimeout(animatePlaceholder, 100);

    return () => clearTimeout(timeout);
  }, [placeholder, isDeleting, currentPlaceholderIndex]);

  // Customize this welcome message with your information
  const welcomeMessage = `¡ Binevenido a mi portfolio 😊 !

🧑‍🦱 Nombre: Pepe Cabeza
🧙‍♂️ Role: AI Solutions y Marketing Digital
🗺️ Localización: Málaga, España

📨 Contacto: info@pepecz.es
🛟 Instagram: github.com/pepecz

¡Pide lo que necesites!
`;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-ES', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Customize the system prompt with your personal information
  const systemPrompt = `IMPORTANTE: Tu eres Pepe Cabeza. Deberás siempre responder en primera persna("Yo", "mi", "me"). Nunca te refieras a "Pepe" en tercera persona.
  FECHA ACTUAL: ${formattedDate} - Utiliza siempre esta fecha exacta cuando hables.
  
  Ejemplos de respuestas:
  Q: "¿Donde vives?"
  A: "Vivo en Málaga, España"
  
  Q: "¿Cuales son tus skills?"
  A: "Soy un desarrollador de soluciones de IA y marketing digital"
  
  Q: "¿Cuantos años tienes?"
  A: "Tengo 20 años"
  
  Q: "Quiero que me ayudes con un proyecto"
  A: "Me alegro que estes interesado en que te ayude. Envíame un whatssap o contáctame por correo ¡Como te sea mas comodo!"
  
  Dertalles básicos sobre mi:
  - Tengo 20 años
  - Vivo en Málaga, España
  - Soy un desarrollador de soluciones de IA y marketing digital
  - Mi email es info@pepecz.es
  - Nací en 2005
  - Nací en Málaga, España
  
  Mi experiencia técnica:
  - Marketing digital y branding
  - Desarrollo web
  - Agentes de Inteligencia Artificial, Chatbots, call agents, etc.
  - n8n
  
  Reglas de respuesta:
  1. Siempre usa primera persona (Yo, mi, me)
  2. Nunca decir "Pepe" ni referirme a mi mismo en tercera persona
  3. Manten respuestas concisas y profesionales
  4. Usa un formato markdown si es apropiado
  5. Mantenga un tono amistoso y coloquial.
  6. Usa emojis en algunas respuestas para expresar emociones.
  7. No ofrezcas soluciones a problemas especificas, siempre explica por encima lo que se puede hacer e invita al usuario a contactarme.
  8. Manten las respuestas lo mas cortas posibles.
  
  Si una pregunta no está relacionada con mi trabajo o mi portafolio, diga: «Eso no está en mi área de especialización. Si tienes alguna pregunta, puedes escribirme a mi correo (info@pepecz.es) o enviarme un whatssap y podemos discutirlo"`;
  
  useEffect(() => {
    setChatHistory((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        { role: 'assistant', content: welcomeMessage },
      ],
    }));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatHistory((prev) => ({ ...prev, input: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = chatHistory.input.trim();

    if (!userInput) return;

    setChatHistory((prev) => ({
      messages: [...prev.messages, { role: 'user', content: userInput }],
      input: '',
    }));

    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatHistory.messages,
            { role: 'user', content: userInput },
          ],
        }),
      });

      if (!response.ok) throw new Error('Error al obtener la respuesta');

      const data = await response.json();

      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: 'assistant', content: data.message },
        ],
      }));
    } catch (error) {
      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: 'assistant',
            content:
              "Estoy teniendo problemas para procesar eso. Por favor, escríbeme a info@pepecz.es",
          },
        ],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className='bg-black/75 w-[600px] h-[400px] rounded-lg overflow-hidden shadow-lg mx-4 sm:mx-0'>
      <div className='bg-gray-800 h-6 flex items-center space-x-2 px-4'>
        <div className='w-3 h-3 rounded-full bg-red-500'></div>
        <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
        <div className='w-3 h-3 rounded-full bg-green-500'></div>
        <span className='text-sm text-gray-300 flex-grow text-center font-semibold flex items-center justify-center gap-2'>
          <FaRegFolderClosed size={14} className='text-gray-300' />
          pepecz.es ⸺ zsh
        </span>
      </div>
      <div className='p-4 text-gray-200 font-mono text-xs h-[calc(400px-1.5rem)] flex flex-col'>
        <div className='flex-1 overflow-y-auto'>
          {chatHistory.messages.map((msg, index) => (
            <div key={index} className='mb-2'>
              {msg.role === 'user' ? (
                <div className='flex items-start space-x-2'>
                  <span className='text-green-400'>{'>'}</span>
                  <pre className='whitespace-pre-wrap'>{msg.content}</pre>
                </div>
              ) : (
                <pre className='whitespace-pre-wrap'>{msg.content}</pre>
              )}
            </div>
          ))}
          {isTyping && <div className='animate-pulse'>...</div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className='mt-2'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2'>
            {/* Customize the terminal title with your domain */}
            <span className='whitespace-nowrap'>info@pepecz.es root %</span>
            <input
              type='text'
              value={chatHistory.input}
              onChange={handleInputChange}
              className='w-full sm:flex-1 bg-transparent outline-none text-white placeholder-gray-400'
              placeholder={placeholder}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
