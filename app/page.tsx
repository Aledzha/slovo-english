"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import frequencyWords from "./data/frequency-words.json";

type Status = "new" | "review" | "learned";
type View = "learn" | "review" | "words";
type Filter = "all" | Status;

type Word = {
  id: number;
  en: string;
  ru: string;
  example: string;
  exampleRu: string;
  status: Status;
  level: number;
  nextReview: number;
  rank: number;
  priority: number;
  custom?: boolean;
};

type WordSeed = [string, string, string, string];
type HistoryItem = { word: Word; view: View };

const STORAGE_KEY = "slovo-progress-v1";
const DAY = 24 * 60 * 60 * 1000;
const INTERVALS = [1, 3, 7, 14, 30];

const wordSeeds: WordSeed[] = [
  ["the", "определённый артикль", "The book is here.", "Книга здесь."],
  ["be", "быть", "I want to be happy.", "Я хочу быть счастливым."],
  ["to", "к; чтобы", "I go to work.", "Я иду на работу."],
  ["of", "из; о; принадлежность", "A cup of tea.", "Чашка чая."],
  ["and", "и", "Tea and coffee.", "Чай и кофе."],
  ["a", "неопределённый артикль", "I have a dog.", "У меня есть собака."],
  ["in", "в", "It is in the box.", "Это в коробке."],
  ["that", "тот; что", "I know that man.", "Я знаю того мужчину."],
  ["have", "иметь", "I have time.", "У меня есть время."],
  ["I", "я", "I am at home.", "Я дома."],
  ["it", "это; оно", "It is good.", "Это хорошо."],
  ["for", "для", "This is for you.", "Это для тебя."],
  ["not", "не", "I am not busy.", "Я не занят."],
  ["on", "на", "The phone is on the table.", "Телефон на столе."],
  ["with", "с", "Come with me.", "Пойдём со мной."],
  ["he", "он", "He is my friend.", "Он мой друг."],
  ["as", "как; в качестве", "Work as a team.", "Работайте как команда."],
  ["you", "ты; вы", "You are welcome.", "Добро пожаловать."],
  ["do", "делать", "What do you do?", "Чем вы занимаетесь?"],
  ["at", "в; у; на", "Meet me at home.", "Встреть меня дома."],
  ["this", "этот; это", "This is my bag.", "Это моя сумка."],
  ["but", "но", "It is small but good.", "Это маленькое, но хорошее."],
  ["his", "его", "This is his car.", "Это его машина."],
  ["by", "у; рядом; посредством", "Sit by me.", "Сядь рядом со мной."],
  ["from", "из; от", "I am from Russia.", "Я из России."],
  ["they", "они", "They are at work.", "Они на работе."],
  ["we", "мы", "We are ready.", "Мы готовы."],
  ["say", "сказать; говорить", "Please say it again.", "Пожалуйста, скажите это снова."],
  ["her", "её; ей", "I know her.", "Я знаю её."],
  ["she", "она", "She is my friend.", "Она мой друг."],
  ["or", "или", "Tea or coffee?", "Чай или кофе?"],
  ["an", "неопределённый артикль", "It is an apple.", "Это яблоко."],
  ["will", "буду; будет", "I will help you.", "Я помогу тебе."],
  ["my", "мой", "My name is Anna.", "Меня зовут Анна."],
  ["one", "один", "I need one ticket.", "Мне нужен один билет."],
  ["all", "все; весь", "That is all.", "Это всё."],
  ["would", "бы", "I would like tea.", "Я хотел бы чай."],
  ["there", "там", "The shop is there.", "Магазин там."],
  ["their", "их", "This is their home.", "Это их дом."],
  ["what", "что; какой", "What is this?", "Что это?"],
  ["so", "так; поэтому", "I think so.", "Я так думаю."],
  ["up", "вверх", "Stand up, please.", "Встаньте, пожалуйста."],
  ["out", "наружу; вне", "Let us go out.", "Давай выйдем."],
  ["if", "если", "Call me if you can.", "Позвони мне, если сможешь."],
  ["about", "о; примерно", "Tell me about it.", "Расскажи мне об этом."],
  ["who", "кто", "Who is he?", "Кто он?"],
  ["get", "получать", "I get a message.", "Я получаю сообщение."],
  ["which", "который; какой", "Which one is yours?", "Который твой?"],
  ["go", "идти; ехать", "I go home.", "Я иду домой."],
  ["me", "мне; меня", "Please help me.", "Пожалуйста, помоги мне."],
  ["when", "когда", "When are you free?", "Когда ты свободен?"],
  ["make", "делать; создавать", "Let us make dinner.", "Давай приготовим ужин."],
  ["can", "мочь", "I can help.", "Я могу помочь."],
  ["like", "нравиться; как", "I like this song.", "Мне нравится эта песня."],
  ["time", "время", "What time is it?", "Который час?"],
  ["no", "нет; никакой", "No problem.", "Нет проблем."],
  ["just", "просто; только что", "Just wait here.", "Просто подожди здесь."],
  ["him", "ему; его", "I can see him.", "Я вижу его."],
  ["know", "знать", "I know this word.", "Я знаю это слово."],
  ["take", "брать", "Take this book.", "Возьми эту книгу."],
  ["people", "люди", "People are waiting.", "Люди ждут."],
  ["into", "внутрь; в", "Come into the room.", "Войди в комнату."],
  ["year", "год", "It was a good year.", "Это был хороший год."],
  ["your", "твой; ваш", "What is your name?", "Как вас зовут?"],
  ["good", "хороший", "This is a good idea.", "Это хорошая идея."],
  ["some", "немного; некоторые", "I need some water.", "Мне нужно немного воды."],
  ["could", "мог бы", "Could you help me?", "Вы могли бы мне помочь?"],
  ["them", "им; их", "I can see them.", "Я вижу их."],
  ["see", "видеть", "I see the house.", "Я вижу дом."],
  ["other", "другой", "Show me the other one.", "Покажи мне другой."],
  ["than", "чем", "It is better than before.", "Это лучше, чем раньше."],
  ["then", "тогда; затем", "See you then.", "Тогда увидимся."],
  ["now", "сейчас", "I am busy now.", "Я сейчас занят."],
  ["look", "смотреть", "Look at this.", "Посмотри на это."],
  ["only", "только", "I have only one.", "У меня только один."],
  ["come", "приходить", "Come here, please.", "Иди сюда, пожалуйста."],
  ["its", "его; её (для предмета)", "The dog knows its name.", "Собака знает своё имя."],
  ["over", "над; через", "The plane is over the city.", "Самолёт над городом."],
  ["think", "думать", "I think you are right.", "Я думаю, ты прав."],
  ["also", "также", "I also like tea.", "Я также люблю чай."],
  ["back", "назад", "Come back soon.", "Возвращайся скорее."],
  ["after", "после", "Call me after work.", "Позвони мне после работы."],
  ["use", "использовать", "I use this every day.", "Я использую это каждый день."],
  ["two", "два", "I have two cats.", "У меня две кошки."],
  ["how", "как", "How are you?", "Как дела?"],
  ["our", "наш", "This is our room.", "Это наша комната."],
  ["work", "работа; работать", "I work every day.", "Я работаю каждый день."],
  ["first", "первый", "This is my first day.", "Это мой первый день."],
  ["well", "хорошо", "You speak well.", "Ты хорошо говоришь."],
  ["way", "путь; способ", "This is the way home.", "Это дорога домой."],
  ["even", "даже", "Even I know it.", "Даже я это знаю."],
  ["new", "новый", "I have a new phone.", "У меня новый телефон."],
  ["want", "хотеть", "I want some tea.", "Я хочу чаю."],
  ["because", "потому что", "I am here because of you.", "Я здесь из-за тебя."],
  ["these", "эти", "These books are new.", "Эти книги новые."],
  ["give", "давать", "Give me a minute.", "Дай мне минуту."],
  ["day", "день", "Have a good day.", "Хорошего дня."],
  ["most", "большинство; самый", "Most people agree.", "Большинство людей согласны."],
  ["us", "нам; нас", "Come with us.", "Пойдём с нами."],
  ["hello", "привет", "Hello, my friend!", "Привет, мой друг!"],
  ["water", "вода", "I drink water.", "Я пью воду."],
  ["home", "дом", "I am at home.", "Я дома."],
  ["food", "еда", "The food is good.", "Еда хорошая."],
  ["friend", "друг", "She is my friend.", "Она мой друг."],
  ["happy", "счастливый", "I am happy today.", "Я сегодня счастлив."],
  ["small", "маленький", "It is a small dog.", "Это маленькая собака."],
  ["help", "помощь; помогать", "Can you help me?", "Ты можешь мне помочь?"],
  ["today", "сегодня", "I am busy today.", "Я сегодня занят."],
  ["family", "семья", "I love my family.", "Я люблю свою семью."],
  ["read", "читать", "I read a book.", "Я читаю книгу."],
  ["morning", "утро", "Good morning!", "Доброе утро!"],
  ["buy", "покупать", "I want to buy bread.", "Я хочу купить хлеб."],
  ["speak", "говорить", "I speak a little English.", "Я немного говорю по-английски."],
];

const priorityForRank = (rank: number) => rank <= 500 ? 1 : rank <= 1500 ? 2 : rank <= 3000 ? 3 : 4;
const priorityLabel = (priority: number, custom?: boolean) => custom
  ? "Моё слово"
  : ({ 1: "Базовые 500", 2: "Очень частые", 3: "Частые", 4: "Расширенный словарь" }[priority] ?? "Полезные");

const manualByEnglish = new Map(wordSeeds.map((seed) => [seed[0].toLowerCase(), seed]));
const starterWords: Word[] = frequencyWords.map((entry, index) => {
  const manual = manualByEnglish.get(entry.en);
  return {
    id: index + 1,
    en: entry.en,
    ru: manual?.[1] ?? entry.ru,
    example: manual?.[2] ?? "",
    exampleRu: manual?.[3] ?? "",
    status: "new",
    level: 0,
    nextReview: 0,
    rank: entry.rank,
    priority: priorityForRank(entry.rank),
  };
});

const frequencyEnglish = new Set(starterWords.map((word) => word.en));
wordSeeds.forEach(([en, ru, example, exampleRu]) => {
  if (!frequencyEnglish.has(en.toLowerCase())) {
    const rank = starterWords.length + 1;
    starterWords.push({ id: rank, en, ru, example, exampleRu, status: "new", level: 0, nextReview: 0, rank, priority: 4 });
  }
});

const restoreWords = (saved: Word[]): Word[] => {
  const savedByEnglish = new Map(saved.map((word) => [word.en.toLowerCase(), word]));
  const merged = starterWords.map((base) => ({ ...base, ...savedByEnglish.get(base.en.toLowerCase()), rank: base.rank, priority: base.priority }));
  const starterEnglish = new Set(starterWords.map((word) => word.en.toLowerCase()));
  const custom = saved.filter((word) => !starterEnglish.has(word.en.toLowerCase())).map((word, index) => ({
    ...word,
    rank: word.rank ?? starterWords.length + index + 1,
    priority: word.priority ?? 5,
    custom: true,
  }));
  return [...merged, ...custom];
};

export default function Home() {
  const [words, setWords] = useState<Word[]>(starterWords);
  const [view, setView] = useState<View>("learn");
  const [filter, setFilter] = useState<Filter>("all");
  const [random, setRandom] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [ready, setReady] = useState(false);
  const [customEn, setCustomEn] = useState("");
  const [customRu, setCustomRu] = useState("");
  const [customExample, setCustomExample] = useState("");
  const [addMessage, setAddMessage] = useState("");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(100);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWords(restoreWords(JSON.parse(raw)));
    } catch { /* The app still works when storage is unavailable. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  }, [words, ready]);

  const counts = useMemo(() => ({
    new: words.filter((word) => word.status === "new").length,
    review: words.filter((word) => word.status === "review").length,
    learned: words.filter((word) => word.status === "learned").length,
  }), [words]);

  const candidates = useMemo(() => {
    const pool = view === "learn"
      ? words.filter((word) => word.status === "new")
      : view === "review"
        ? words.filter((word) => word.status === "review" && word.nextReview <= Date.now())
        : [];
    return [...pool].sort((a, b) => a.priority - b.priority || a.rank - b.rank);
  }, [view, words]);

  const current = candidates.find((word) => word.id === activeId) ?? candidates[0];
  const learnedPercent = Math.round((counts.learned / words.length) * 100);
  const dueCount = words.filter((word) => word.status === "review" && word.nextReview <= Date.now()).length;

  const nextFrom = (currentId: number) => {
    const remaining = candidates.filter((word) => word.id !== currentId);
    if (!remaining.length) return null;
    const bestPriority = remaining[0].priority;
    const currentTier = remaining.filter((word) => word.priority === bestPriority);
    return random ? currentTier[Math.floor(Math.random() * currentTier.length)] : currentTier[0];
  };

  const recordAndUpdate = (patch: Partial<Word>) => {
    if (!current) return;
    setHistory((items) => [...items, { word: { ...current }, view }]);
    setActiveId(nextFrom(current.id)?.id ?? null);
    setRevealed(false);
    setWords((all) => all.map((word) => word.id === current.id ? { ...word, ...patch } : word));
  };

  const goPrevious = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setWords((all) => all.map((word) => word.id === previous.word.id ? previous.word : word));
    setView(previous.view);
    setActiveId(previous.word.id);
    setRevealed(false);
    setHistory((items) => items.slice(0, -1));
  };

  const answerNew = (known: boolean) => recordAndUpdate(known
    ? { status: "learned", level: 0, nextReview: 0 }
    : { status: "review", level: 0, nextReview: Date.now() });

  const answerReview = (remembered: boolean) => {
    if (!current) return;
    if (!remembered) return recordAndUpdate({ level: 0, nextReview: Date.now() + DAY });
    const nextLevel = Math.min(current.level + 1, INTERVALS.length - 1);
    recordAndUpdate({ level: nextLevel, nextReview: Date.now() + INTERVALS[nextLevel] * DAY });
  };

  const openView = (next: View) => {
    setView(next);
    setActiveId(null);
    setRevealed(false);
    setHistory([]);
  };

  const addCustomWord = (event: FormEvent) => {
    event.preventDefault();
    const en = customEn.trim().toLowerCase();
    const ru = customRu.trim();
    if (!en || !ru) return;
    const existing = words.find((word) => word.en.toLowerCase() === en);
    if (existing) {
      setWords((all) => all.map((word) => word.id === existing.id ? { ...word, ru, status: "review", level: 0, nextReview: Date.now() } : word));
      setAddMessage("Слово уже было в словаре — добавил его в повторение.");
    } else {
      setWords((all) => [...all, {
        id: Date.now(), en, ru, example: customExample.trim() || `I know the word “${en}”.`,
        exampleRu: customExample.trim() ? "Ваш пример" : `Я знаю слово «${en}».`,
        status: "review", level: 0, nextReview: Date.now(), rank: all.length + 1, priority: 5, custom: true,
      }]);
      setAddMessage("Готово — слово добавлено в повторение.");
    }
    setCustomEn(""); setCustomRu(""); setCustomExample("");
  };

  const filteredWords = words.filter((word) => {
    const matchesFilter = filter === "all" || word.status === filter;
    const query = search.trim().toLowerCase();
    return matchesFilter && (!query || word.en.toLowerCase().includes(query) || word.ru.toLowerCase().includes(query));
  });
  const visibleWords = filteredWords.slice(0, visibleCount);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); openView("learn"); }}>
          <span className="brandMark">S</span><span><strong>Слово</strong><small>английский без спешки</small></span>
        </a>
        <nav aria-label="Разделы">
          <button className={view === "learn" ? "navActive" : ""} onClick={() => openView("learn")}>Учить</button>
          <button className={view === "review" ? "navActive" : ""} onClick={() => openView("review")}>Повторять <span className="navCount">{dueCount}</span></button>
          <button className={view === "words" ? "navActive" : ""} onClick={() => openView("words")}>Мои слова</button>
        </nav>
      </header>

      <section className="shell">
        <div className="progressPanel">
          <div className="progressText"><span className="eyebrow">Ваш прогресс</span><strong>{counts.learned} <small>из {words.length} слов</small></strong></div>
          <div className="progressTrack" aria-label={`Выучено ${learnedPercent}%`}><span style={{ width: `${learnedPercent}%` }} /></div>
          <div className="progressPercent">{learnedPercent}%</div>
        </div>

        {view !== "words" ? (
          <section className="studyArea">
            <div className="sectionHeading">
              <div><span className="eyebrow">{view === "learn" ? "Частотный порядок" : "Пора повторить"}</span><h1>{view === "learn" ? "Сначала — самые нужные слова" : "Вспомните перевод"}</h1></div>
              <label className="toggleLabel"><input type="checkbox" checked={random} onChange={(event) => setRandom(event.target.checked)} /><span className="toggle" /> Перемешивать уровень</label>
            </div>

            {current ? (
              <article className="wordCard">
                <div className="cardTop"><span>{priorityLabel(current.priority, current.custom)} · {current.custom ? "добавлено вами" : `частота № ${current.rank}`}</span><span className="soundHint">EN</span></div>
                <div className="wordContent">
                  <div className="word">{current.en}</div>{current.example && <div className="example">“{current.example}”</div>}
                  {revealed ? <div className="translation" role="status"><strong>{current.ru}</strong>{current.exampleRu && <span>{current.exampleRu}</span>}</div> : <button className="revealButton" onClick={() => setRevealed(true)}>Показать перевод</button>}
                </div>
                <div className="backRow"><button className="backButton" onClick={goPrevious} disabled={!history.length}>← Предыдущее слово</button></div>
                <div className="actions">
                  {view === "learn" ? <><button className="secondaryAction" onClick={() => answerNew(false)}><span>×</span> Не знаю</button><button className="primaryAction" onClick={() => answerNew(true)}><span>✓</span> Знаю</button></> : <><button className="secondaryAction" onClick={() => answerReview(false)}><span>↺</span> Ещё учу</button><button className="primaryAction" onClick={() => answerReview(true)}><span>✓</span> Помню</button></>}
                </div>
                {view === "review" && <button className="learnedLink" onClick={() => recordAndUpdate({ status: "learned", level: 0, nextReview: 0 })}>Убрать из повторения — слово выучено</button>}
              </article>
            ) : (
              <div className="emptyState"><div className="emptyIcon">✓</div><h2>{view === "learn" ? "Новые слова закончились" : "На сегодня всё"}</h2><p>{view === "learn" ? "Отличная работа! Теперь можно повторить сложные слова." : counts.review ? `Следующие слова появятся здесь по расписанию. Всего в повторении: ${counts.review}.` : "Добавьте незнакомое слово — оно появится здесь сразу."}</p><button className="primaryAction solo" onClick={() => openView(view === "learn" ? "review" : "words")}>{view === "learn" ? "Перейти к повторению" : "Добавить своё слово"}</button></div>
            )}
            <p className="saveNote"><span>✓</span> Прогресс сохраняется автоматически на этом устройстве</p>
          </section>
        ) : (
          <section className="wordsArea">
            <div className="sectionHeading wordsHeading"><div><span className="eyebrow">Словарь · 5 000+</span><h1>Мои слова</h1></div><div className="filters" aria-label="Фильтр слов">{(["all", "new", "review", "learned"] as Filter[]).map((item) => <button key={item} className={filter === item ? "filterActive" : ""} onClick={() => { setFilter(item); setVisibleCount(100); }}>{{ all: "Все", new: "Новые", review: "На повторении", learned: "Выученные" }[item]}</button>)}</div></div>
            <form className="addWordForm" onSubmit={addCustomWord}>
              <div className="formIntro"><strong>Добавить своё слово</strong><span>Оно сразу попадёт в список повторения</span></div>
              <label>Слово на английском<input value={customEn} onChange={(event) => setCustomEn(event.target.value)} placeholder="например: journey" required /></label>
              <label>Перевод<input value={customRu} onChange={(event) => setCustomRu(event.target.value)} placeholder="путешествие" required /></label>
              <label>Короткий пример <small>необязательно</small><input value={customExample} onChange={(event) => setCustomExample(event.target.value)} placeholder="It was a long journey." /></label>
              <button className="primaryAction" type="submit">+ Добавить</button>
              {addMessage && <p className="formMessage" role="status">{addMessage}</p>}
            </form>
            <div className="libraryTools"><div className="librarySummary"><strong>{filteredWords.length} слов</strong><span>Самые употребительные показываются первыми.</span></div><input className="wordSearch" value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(100); }} placeholder="Найти слово или перевод" aria-label="Поиск по словарю" /></div>
            <div className="wordList">{visibleWords.map((word) => <div className="wordRow" key={word.id}><div><strong>{word.en}</strong>{word.example && <span>{word.example}</span>}</div><div className="rowTranslation">{word.ru}<small>{priorityLabel(word.priority, word.custom)}{!word.custom && ` · № ${word.rank}`}</small></div><span className={`status status-${word.status}`}>{{ new: "Новое", review: "На повторении", learned: "Выучено" }[word.status]}</span></div>)}</div>
            {visibleCount < filteredWords.length && <button className="loadMore" onClick={() => setVisibleCount((count) => count + 100)}>Показать ещё 100</button>}
          </section>
        )}
      </section>
    </main>
  );
}

