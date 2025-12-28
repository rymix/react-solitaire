// src/types.ts
var SUIT_INFO = {
  hearts: { symbol: "\u2665", colour: "red", name: "Hearts" },
  diamonds: { symbol: "\u2666", colour: "red", name: "Diamonds" },
  clubs: { symbol: "\u2663", colour: "black", name: "Clubs" },
  spades: { symbol: "\u2660", colour: "black", name: "Spades" }
};
var RANK_INFO = {
  1: { symbol: "A", name: "Ace" },
  2: { symbol: "2", name: "Two" },
  3: { symbol: "3", name: "Three" },
  4: { symbol: "4", name: "Four" },
  5: { symbol: "5", name: "Five" },
  6: { symbol: "6", name: "Six" },
  7: { symbol: "7", name: "Seven" },
  8: { symbol: "8", name: "Eight" },
  9: { symbol: "9", name: "Nine" },
  10: { symbol: "10", name: "Ten" },
  11: { symbol: "J", name: "Jack" },
  12: { symbol: "Q", name: "Queen" },
  13: { symbol: "K", name: "King" }
};
function getCardColour(card) {
  return SUIT_INFO[card.suit].colour;
}
function getCardDisplay(card) {
  return `${RANK_INFO[card.rank].symbol}${SUIT_INFO[card.suit].symbol}`;
}

// src/deck.ts
var SUITS = ["hearts", "diamonds", "clubs", "spades"];
var RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
function createCardId(suit, rank) {
  return `${suit}-${rank}`;
}
function createCard(suit, rank, faceUp = false) {
  return {
    id: createCardId(suit, rank),
    suit,
    rank,
    faceUp
  };
}
function createDeck() {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(createCard(suit, rank, false));
    }
  }
  return cards;
}
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function shuffleWithSeed(array, seed) {
  const result = [...array];
  const a = 1103515245;
  const c = 12345;
  const m = 2 ** 31;
  let current = seed;
  const seededRandom = () => {
    current = (a * current + c) % m;
    return current / m;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function createShuffledDeck(seed) {
  const deck = createDeck();
  return seed !== void 0 ? shuffleWithSeed(deck, seed) : shuffle(deck);
}
function flipCard(card, faceUp) {
  if (card.faceUp === faceUp) return card;
  return { ...card, faceUp };
}
function isSameCard(a, b) {
  return a.id === b.id;
}
function findCard(cards, id) {
  return cards.find((card) => card.id === id);
}

// src/rules.ts
function canPlaceOnFoundation(card, foundation) {
  const topCard = foundation.cards.at(-1);
  if (!topCard) {
    return card.rank === 1;
  }
  return card.suit === topCard.suit && card.rank === topCard.rank + 1;
}
function canPlaceOnTableau(card, tableau) {
  const topCard = tableau.cards.at(-1);
  if (!topCard) {
    return card.rank === 13;
  }
  if (!topCard.faceUp) {
    return false;
  }
  const cardColour = getCardColour(card);
  const topCardColour = getCardColour(topCard);
  return cardColour !== topCardColour && card.rank === topCard.rank - 1;
}
function getPile(state, location) {
  switch (location.pileType) {
    case "stock":
      return state.stock;
    case "waste":
      return state.waste;
    case "foundation":
      return state.foundations[location.pileIndex] ?? null;
    case "tableau":
      return state.tableau[location.pileIndex] ?? null;
    default:
      return null;
  }
}
function getCardAt(state, location) {
  const pile = getPile(state, location);
  if (!pile) return null;
  return pile.cards[location.cardIndex] ?? null;
}
function canPickUpCards(pile, fromIndex) {
  if (pile.type === "stock") {
    return false;
  }
  if (pile.type === "waste") {
    return fromIndex === pile.cards.length - 1;
  }
  if (pile.type === "foundation") {
    return fromIndex === pile.cards.length - 1;
  }
  for (let i = fromIndex; i < pile.cards.length; i++) {
    if (!pile.cards[i].faceUp) {
      return false;
    }
  }
  return true;
}
function isValidMove(state, from, to, cardCount) {
  const sourcePile = getPile(state, from);
  const destPile = getPile(state, to);
  if (!sourcePile || !destPile) {
    return false;
  }
  if (!canPickUpCards(sourcePile, from.cardIndex)) {
    return false;
  }
  const availableCards = sourcePile.cards.length - from.cardIndex;
  if (cardCount > availableCards) {
    return false;
  }
  const movingCard = sourcePile.cards[from.cardIndex];
  if (!movingCard) {
    return false;
  }
  if (destPile.type === "stock" || destPile.type === "waste") {
    return false;
  }
  if (destPile.type === "foundation") {
    if (cardCount !== 1) {
      return false;
    }
    return canPlaceOnFoundation(movingCard, destPile);
  }
  if (destPile.type === "tableau") {
    return canPlaceOnTableau(movingCard, destPile);
  }
  return false;
}
function findValidMoves(state, from) {
  const sourcePile = getPile(state, from);
  if (!sourcePile) return [];
  const cardCount = sourcePile.cards.length - from.cardIndex;
  const validDestinations = [];
  if (cardCount === 1) {
    for (let i = 0; i < 4; i++) {
      const to = { pileType: "foundation", pileIndex: i, cardIndex: state.foundations[i].cards.length };
      if (isValidMove(state, from, to, 1)) {
        validDestinations.push(to);
      }
    }
  }
  for (let i = 0; i < 7; i++) {
    const to = { pileType: "tableau", pileIndex: i, cardIndex: state.tableau[i].cards.length };
    if (isValidMove(state, from, to, cardCount)) {
      validDestinations.push(to);
    }
  }
  return validDestinations;
}
function checkWinCondition(state) {
  const totalOnFoundations = state.foundations.reduce(
    (sum, foundation) => sum + foundation.cards.length,
    0
  );
  return totalOnFoundations === 52;
}
function hasValidMoves(state) {
  if (state.waste.cards.length > 0) {
    const wasteTop = {
      pileType: "waste",
      pileIndex: 0,
      cardIndex: state.waste.cards.length - 1
    };
    if (findValidMoves(state, wasteTop).length > 0) {
      return true;
    }
  }
  for (let i = 0; i < 7; i++) {
    const tableau = state.tableau[i];
    for (let j = 0; j < tableau.cards.length; j++) {
      if (tableau.cards[j].faceUp) {
        const location = {
          pileType: "tableau",
          pileIndex: i,
          cardIndex: j
        };
        if (findValidMoves(state, location).length > 0) {
          return true;
        }
      }
    }
  }
  if (state.stock.cards.length > 0) {
    return true;
  }
  if (state.waste.cards.length > 0) {
    if (state.config.unlimitedPasses) {
      return true;
    }
    if (state.config.scoringMode === "vegas" && state.stockPasses < 3) {
      return true;
    }
  }
  return false;
}
function canAutoComplete(state) {
  for (const tableau of state.tableau) {
    for (const card of tableau.cards) {
      if (!card.faceUp) {
        return false;
      }
    }
  }
  if (state.stock.cards.length > 0) {
    return false;
  }
  if (state.waste.cards.length > 0) {
    return false;
  }
  return true;
}
function findAutoCompleteMove(state) {
  for (let i = 0; i < 7; i++) {
    const tableau = state.tableau[i];
    if (tableau.cards.length === 0) continue;
    const topCard = tableau.cards.at(-1);
    const from = {
      pileType: "tableau",
      pileIndex: i,
      cardIndex: tableau.cards.length - 1
    };
    for (let j = 0; j < 4; j++) {
      const foundation = state.foundations[j];
      if (canPlaceOnFoundation(topCard, foundation)) {
        return {
          from,
          to: { pileType: "foundation", pileIndex: j, cardIndex: foundation.cards.length }
        };
      }
    }
  }
  return null;
}

// src/scoring.ts
var STANDARD_SCORES = {
  /** Waste to tableau */
  wasteToTableau: 5,
  /** Waste to foundation */
  wasteToFoundation: 10,
  /** Tableau to foundation */
  tableauToFoundation: 10,
  /** Turn over tableau card */
  turnOverTableauCard: 5,
  /** Foundation back to tableau (penalty) */
  foundationToTableau: -15,
  /** Recycle waste to stock (draw-three only, per pass) */
  recycleWaste: -20
};
var VEGAS_SCORES = {
  /** Initial cost to play */
  initialCost: -52,
  /** Each card to foundation */
  cardToFoundation: 5,
  /** Foundation back to tableau */
  foundationToTableau: -5
};
function calculateStandardScore(move, _state) {
  let score = 0;
  const { from, to, flippedCard } = move;
  if (from.pileType === "waste" && to.pileType === "tableau") {
    score += STANDARD_SCORES.wasteToTableau;
  }
  if (from.pileType === "waste" && to.pileType === "foundation") {
    score += STANDARD_SCORES.wasteToFoundation;
  }
  if (from.pileType === "tableau" && to.pileType === "foundation") {
    score += STANDARD_SCORES.tableauToFoundation;
  }
  if (from.pileType === "foundation" && to.pileType === "tableau") {
    score += STANDARD_SCORES.foundationToTableau;
  }
  if (flippedCard) {
    score += STANDARD_SCORES.turnOverTableauCard;
  }
  return score;
}
function calculateVegasScore(move, _state) {
  let score = 0;
  const { from, to } = move;
  if (to.pileType === "foundation") {
    score += VEGAS_SCORES.cardToFoundation;
  }
  if (from.pileType === "foundation" && to.pileType === "tableau") {
    score += VEGAS_SCORES.foundationToTableau;
  }
  return score;
}
function calculateMoveScore(move, state) {
  switch (state.config.scoringMode) {
    case "standard":
      return calculateStandardScore(move, state);
    case "vegas":
      return calculateVegasScore(move, state);
    case "none":
      return 0;
    default:
      return 0;
  }
}
function getInitialScore(scoringMode) {
  switch (scoringMode) {
    case "vegas":
      return VEGAS_SCORES.initialCost;
    case "standard":
    case "none":
    default:
      return 0;
  }
}
function getRecycleWastePenalty(state) {
  if (state.config.scoringMode !== "standard") {
    return 0;
  }
  if (state.config.drawMode !== "draw-three") {
    return 0;
  }
  return STANDARD_SCORES.recycleWaste;
}
function calculateTimeBonus(elapsedSeconds) {
  if (elapsedSeconds <= 30) {
    return 0;
  }
  const bonus = Math.floor(7e5 / elapsedSeconds);
  return Math.max(0, Math.min(bonus, 7e5));
}
function formatScore(score, scoringMode) {
  switch (scoringMode) {
    case "vegas":
      if (score >= 0) {
        return `$${score}`;
      }
      return `-$${Math.abs(score)}`;
    case "standard":
    case "none":
    default:
      return score.toString();
  }
}

// src/game.ts
var DEFAULT_CONFIG = {
  drawMode: "draw-one",
  scoringMode: "standard",
  unlimitedPasses: true,
  autoFlipTableau: false
  // Match original Windows Solitaire - click to flip
};
function createPile(type, index) {
  const id = type === "tableau" || type === "foundation" ? `${type}-${index}` : type;
  return {
    id,
    type,
    cards: [],
    ...type === "tableau" && { tableauIndex: index }
  };
}
function createInitialState(config = {}, seed) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const deck = createShuffledDeck(seed);
  const stock = createPile("stock", 0);
  const waste = createPile("waste", 0);
  const foundations = [
    createPile("foundation", 0),
    createPile("foundation", 1),
    createPile("foundation", 2),
    createPile("foundation", 3)
  ];
  const tableau = [
    createPile("tableau", 0),
    createPile("tableau", 1),
    createPile("tableau", 2),
    createPile("tableau", 3),
    createPile("tableau", 4),
    createPile("tableau", 5),
    createPile("tableau", 6)
  ];
  let cardIndex = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = col; row < 7; row++) {
      const card = deck[cardIndex++];
      const isFaceUp = row === col;
      tableau[row].cards.push(flipCard(card, isFaceUp));
    }
  }
  while (cardIndex < deck.length) {
    stock.cards.push(deck[cardIndex++]);
  }
  return {
    stock,
    waste,
    foundations,
    tableau,
    score: getInitialScore(fullConfig.scoringMode),
    moves: 0,
    startTime: null,
    endTime: null,
    isWon: false,
    stockPasses: 0,
    config: fullConfig
  };
}
function cloneState(state) {
  return {
    ...state,
    stock: { ...state.stock, cards: [...state.stock.cards.map((c) => ({ ...c }))] },
    waste: { ...state.waste, cards: [...state.waste.cards.map((c) => ({ ...c }))] },
    foundations: state.foundations.map((f) => ({
      ...f,
      cards: [...f.cards.map((c) => ({ ...c }))]
    })),
    tableau: state.tableau.map((t) => ({
      ...t,
      cards: [...t.cards.map((c) => ({ ...c }))]
    })),
    config: { ...state.config }
  };
}
function drawFromStock(state) {
  if (state.stock.cards.length === 0) {
    return state;
  }
  const newState = cloneState(state);
  const drawCount = state.config.drawMode === "draw-three" ? 3 : 1;
  const cardsToMove = Math.min(drawCount, newState.stock.cards.length);
  for (let i = 0; i < cardsToMove; i++) {
    const card = newState.stock.cards.pop();
    newState.waste.cards.push(flipCard(card, true));
  }
  if (newState.startTime === null) {
    newState.startTime = Date.now();
  }
  newState.moves++;
  return newState;
}
function resetStock(state) {
  if (state.waste.cards.length === 0) {
    return state;
  }
  if (state.config.scoringMode === "vegas" && !state.config.unlimitedPasses) {
    if (state.stockPasses >= 3) {
      return state;
    }
  }
  const newState = cloneState(state);
  while (newState.waste.cards.length > 0) {
    const card = newState.waste.cards.pop();
    newState.stock.cards.push(flipCard(card, false));
  }
  newState.stockPasses++;
  newState.moves++;
  const penalty = getRecycleWastePenalty(newState);
  newState.score = Math.max(0, newState.score + penalty);
  return newState;
}
function executeMove(state, from, to, cardCount) {
  if (!isValidMove(state, from, to, cardCount)) {
    return { success: false, error: "Invalid move" };
  }
  const newState = cloneState(state);
  const sourcePile = getPile(newState, from);
  const destPile = getPile(newState, to);
  const movedCards = sourcePile.cards.splice(from.cardIndex, cardCount);
  destPile.cards.push(...movedCards);
  let flippedCard = false;
  if (sourcePile.type === "tableau" && sourcePile.cards.length > 0 && newState.config.autoFlipTableau) {
    const topCard = sourcePile.cards.at(-1);
    if (!topCard.faceUp) {
      sourcePile.cards[sourcePile.cards.length - 1] = flipCard(topCard, true);
      flippedCard = true;
    }
  }
  if (newState.startTime === null) {
    newState.startTime = Date.now();
  }
  const move = {
    from,
    to,
    cardCount,
    flippedCard,
    scoreChange: 0
  };
  move.scoreChange = calculateMoveScore(move, newState);
  newState.score += move.scoreChange;
  newState.moves++;
  if (checkWinCondition(newState)) {
    newState.isWon = true;
    newState.endTime = Date.now();
  }
  return { success: true, state: newState, move };
}
function flipTableauCard(state, tableauIndex) {
  if (tableauIndex < 0 || tableauIndex >= 7) {
    return { success: false, error: "Invalid tableau index" };
  }
  const tableau = state.tableau[tableauIndex];
  if (tableau.cards.length === 0) {
    return { success: false, error: "Tableau is empty" };
  }
  const topCard = tableau.cards.at(-1);
  if (topCard.faceUp) {
    return { success: false, error: "Card is already face up" };
  }
  const newState = cloneState(state);
  const newTableau = newState.tableau[tableauIndex];
  newTableau.cards[newTableau.cards.length - 1] = flipCard(topCard, true);
  if (newState.startTime === null) {
    newState.startTime = Date.now();
  }
  return { success: true, state: newState };
}
function canAutoMove(state, from) {
  const sourcePile = getPile(state, from);
  if (!sourcePile) return null;
  const card = sourcePile.cards[from.cardIndex];
  if (!card || !card.faceUp) return null;
  if (from.cardIndex === sourcePile.cards.length - 1) {
    for (let i = 0; i < 4; i++) {
      const to = {
        pileType: "foundation",
        pileIndex: i,
        cardIndex: state.foundations[i].cards.length
      };
      if (isValidMove(state, from, to, 1)) {
        return to;
      }
    }
    if (card.rank === 13) {
      for (let i = 0; i < 7; i++) {
        if (state.tableau[i].cards.length === 0) {
          return {
            pileType: "tableau",
            pileIndex: i,
            cardIndex: 0
          };
        }
      }
    }
  } else {
    if (card.rank === 13) {
      for (let i = from.cardIndex; i < sourcePile.cards.length; i++) {
        if (!sourcePile.cards[i].faceUp) return null;
      }
      for (let i = 0; i < 7; i++) {
        if (state.tableau[i].cards.length === 0) {
          return {
            pileType: "tableau",
            pileIndex: i,
            cardIndex: 0
          };
        }
      }
    }
  }
  return null;
}
function autoMoveToFoundation(state, from) {
  const sourcePile = getPile(state, from);
  if (!sourcePile) {
    return { success: false, error: "Invalid source pile" };
  }
  if (from.cardIndex !== sourcePile.cards.length - 1) {
    const card2 = sourcePile.cards[from.cardIndex];
    if (card2 && card2.faceUp && card2.rank === 13) {
      let canMoveStack = true;
      for (let i = from.cardIndex; i < sourcePile.cards.length; i++) {
        if (!sourcePile.cards[i].faceUp) {
          canMoveStack = false;
          break;
        }
      }
      if (canMoveStack) {
        for (let i = 0; i < 7; i++) {
          if (state.tableau[i].cards.length === 0) {
            const to = {
              pileType: "tableau",
              pileIndex: i,
              cardIndex: 0
            };
            const cardCount = sourcePile.cards.length - from.cardIndex;
            return executeMove(state, from, to, cardCount);
          }
        }
      }
    }
    return { success: false, error: "Can only auto-move top card or Kings to empty columns" };
  }
  const card = sourcePile.cards[from.cardIndex];
  if (!card || !card.faceUp) {
    return { success: false, error: "Card not available" };
  }
  for (let i = 0; i < 4; i++) {
    const to = {
      pileType: "foundation",
      pileIndex: i,
      cardIndex: state.foundations[i].cards.length
    };
    if (isValidMove(state, from, to, 1)) {
      return executeMove(state, from, to, 1);
    }
  }
  if (card.rank === 13) {
    for (let i = 0; i < 7; i++) {
      if (state.tableau[i].cards.length === 0) {
        const to = {
          pileType: "tableau",
          pileIndex: i,
          cardIndex: 0
        };
        return executeMove(state, from, to, 1);
      }
    }
  }
  return { success: false, error: "No valid move for this card" };
}
function autoCompleteStep(state) {
  const move = findAutoCompleteMove(state);
  if (!move) {
    return null;
  }
  const result = executeMove(state, move.from, move.to, 1);
  return result.success ? result.state : null;
}
function getAllCards(state) {
  return [
    ...state.stock.cards,
    ...state.waste.cards,
    ...state.foundations.flatMap((f) => f.cards),
    ...state.tableau.flatMap((t) => t.cards)
  ];
}
function validateState(state) {
  const errors = [];
  const allCards = getAllCards(state);
  if (allCards.length !== 52) {
    errors.push(`Expected 52 cards, found ${allCards.length}`);
  }
  const cardIds = /* @__PURE__ */ new Set();
  for (const card of allCards) {
    if (cardIds.has(card.id)) {
      errors.push(`Duplicate card: ${card.id}`);
    }
    cardIds.add(card.id);
  }
  for (let i = 0; i < 4; i++) {
    const foundation = state.foundations[i];
    for (let j = 0; j < foundation.cards.length; j++) {
      const card = foundation.cards[j];
      if (j === 0 && card.rank !== 1) {
        errors.push(`Foundation ${i} first card should be Ace, found rank ${card.rank}`);
      }
      if (j > 0) {
        const prevCard = foundation.cards[j - 1];
        if (card.suit !== prevCard.suit) {
          errors.push(`Foundation ${i} has mixed suits`);
        }
        if (card.rank !== prevCard.rank + 1) {
          errors.push(`Foundation ${i} cards not in sequence`);
        }
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
var GameHistory = class {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = 100;
  }
  /**
   * Record a state change
   */
  push(entry) {
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(entry);
    this.currentIndex++;
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }
  /**
   * Check if undo is available
   */
  canUndo() {
    return this.currentIndex >= 0;
  }
  /**
   * Check if redo is available
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }
  /**
   * Get the state for undo
   */
  undo() {
    if (!this.canUndo()) {
      return null;
    }
    const entry = this.history[this.currentIndex];
    this.currentIndex--;
    return entry.previousState;
  }
  /**
   * Get the move for redo (we need to re-execute it)
   */
  redo() {
    if (!this.canRedo()) {
      return null;
    }
    this.currentIndex++;
    return this.history[this.currentIndex];
  }
  /**
   * Clear all history
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
  /**
   * Get current history size
   */
  size() {
    return this.history.length;
  }
};
function createWonState(config) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const foundations = suits.map((suit, index) => ({
    id: `foundation-${index}`,
    type: "foundation",
    cards: Array.from({ length: 13 }, (_, rank) => ({
      id: `${suit}-${rank + 1}`,
      suit,
      rank: rank + 1,
      faceUp: true
    }))
  }));
  const startTime = Date.now() - 180 * 1e3;
  const endTime = Date.now();
  const tableau = [
    { id: "tableau-0", type: "tableau", cards: [] },
    { id: "tableau-1", type: "tableau", cards: [] },
    { id: "tableau-2", type: "tableau", cards: [] },
    { id: "tableau-3", type: "tableau", cards: [] },
    { id: "tableau-4", type: "tableau", cards: [] },
    { id: "tableau-5", type: "tableau", cards: [] },
    { id: "tableau-6", type: "tableau", cards: [] }
  ];
  return {
    config: fullConfig,
    stock: { id: "stock", type: "stock", cards: [] },
    waste: { id: "waste", type: "waste", cards: [] },
    foundations,
    tableau,
    score: fullConfig.scoringMode === "vegas" ? 260 : 3e3,
    moves: 150,
    startTime,
    endTime,
    isWon: true,
    stockPasses: 0
  };
}
export {
  DEFAULT_CONFIG,
  GameHistory,
  RANKS,
  RANK_INFO,
  STANDARD_SCORES,
  SUITS,
  SUIT_INFO,
  VEGAS_SCORES,
  autoCompleteStep,
  autoMoveToFoundation,
  calculateMoveScore,
  calculateStandardScore,
  calculateTimeBonus,
  calculateVegasScore,
  canAutoComplete,
  canAutoMove,
  canPickUpCards,
  canPlaceOnFoundation,
  canPlaceOnTableau,
  checkWinCondition,
  cloneState,
  createCard,
  createCardId,
  createDeck,
  createInitialState,
  createShuffledDeck,
  createWonState,
  drawFromStock,
  executeMove,
  findAutoCompleteMove,
  findCard,
  findValidMoves,
  flipCard,
  flipTableauCard,
  formatScore,
  getAllCards,
  getCardAt,
  getCardColour,
  getCardDisplay,
  getInitialScore,
  getPile,
  getRecycleWastePenalty,
  hasValidMoves,
  isSameCard,
  isValidMove,
  resetStock,
  shuffle,
  shuffleWithSeed,
  validateState
};
