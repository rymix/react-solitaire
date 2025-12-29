import { useState, useCallback, useMemo } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { 
  Solitaire, 
  win31Theme, 
  CardBackSelector,
  type SolitaireTheme, 
  CARD_BACKS
} from '@react-solitaire/react';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body, #root {
    width: 100%;
    height: 100%;
    overflow: hidden;
    user-select: none;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: #008080;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: normal;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardIcon = styled.span`
  font-size: 20px;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Select = styled.select`
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #999;
  border-radius: 2px;
  background: white;
  cursor: pointer;
`;

const Button = styled.button`
  padding: 4px 12px;
  font-size: 12px;
  background: #c0c0c0;
  border: 2px outset #ffffff;
  cursor: pointer;
  
  &:active {
    border-style: inset;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
`;

const GameContainer = styled.main`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const WinMessage = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px 48px;
  border: 3px outset #c0c0c0;
  text-align: center;
  z-index: 10001;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
`;

const WinTitle = styled.h2`
  margin-bottom: 16px;
  color: #000080;
`;

const WinStats = styled.div`
  margin-bottom: 16px;
  font-size: 14px;
  
  p {
    margin: 4px 0;
  }
`;

const SettingsPanel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 50px;
  right: ${p => p.$isOpen ? '0' : '-500px'};
  width: 500px;
  background: #c0c0c0;
  border: 2px outset #ffffff;
  box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  transition: right 0.3s ease;
  max-height: calc(100vh - 60px);
  overflow-y: auto;
`;

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #000080;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: #c0c0c0;
  border: 2px outset #ffffff;
  width: 20px;
  height: 20px;
  font-size: 10px;
  cursor: pointer;
  
  &:active {
    border-style: inset;
  }
`;

type DrawModeOption = 'draw-one' | 'draw-three';

// Check for debug mode via querystring
const isDebugMode = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === '1' || params.get('debug') === 'true';
};

function App() {
  const [drawMode, setDrawMode] = useState<DrawModeOption>('draw-one');
  const [newGameTrigger, setNewGameTrigger] = useState(0);
  const [winStats, setWinStats] = useState<{ time: number; moves: number; score: number } | null>(null);
  const [cardBack, setCardBack] = useState(
    () => CARD_BACKS[Math.floor(Math.random() * CARD_BACKS.length)].id
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const showDebugControls = isDebugMode();

  // Create theme with GIF asset configuration
  const theme = useMemo<SolitaireTheme>(() => {
    return {
      ...win31Theme,
      // Adjust card dimensions to match the GIF assets (71x96)
      card: {
        ...win31Theme.card,
        width: 71,
        height: 96,
        borderRadius: 0,
        borderWidth: 0,
      },
      assets: {
        enabled: true,
        basePath: '/cards',
        cardBack: cardBack,
        stockEmpty: 'Space-Yes.gif',
        stockDisabled: 'Space-No.gif',
        foundationEmpty: 'Space-Vacant.gif',
      },
    };
  }, [cardBack]);

  const confirmNewGame = () => {
    if (window.confirm('This will start a new game. Continue?')) {
      return true;
    }

    return false;
  }

  const handleNewGame = useCallback((forceStart:boolean = false) => {
    if (forceStart || confirmNewGame()) {
      setNewGameTrigger(prev => prev + 1);
      setWinStats(null);
    }
  }, []);

  const handleDrawModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (confirmNewGame()) {
      setDrawMode(e.target.value as DrawModeOption);
      handleNewGame(true);
    }
  };

    const handleWin = useCallback((stats: { time: number; moves: number; score: number }) => {
    setWinStats(stats);
  }, []);

  const handleCardBackChange = (newCardBack: string) => {
    setCardBack(newCardBack);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Title>
            Klondike Solitaire
          </Title>
          
          <Controls>
            <CheckboxLabel>
              <input 
                type="checkbox" 
                checked={soundEnabled} 
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              Sound
            </CheckboxLabel>

            <Button onClick={() => setSettingsOpen(!settingsOpen)}>
              Card Backs
            </Button>

            <label style={{ color: 'white', fontSize: 12 }}>
              Draw:
              <Select value={drawMode} onChange={handleDrawModeChange} style={{ marginLeft: 4 }}>
                <option value="draw-one">Draw 1</option>
                <option value="draw-three">Draw 3</option>
              </Select>
            </label>
                        
            <Button onClick={() => handleNewGame(false)}>
              New Game
            </Button>
          </Controls>
        </Header>
        
        <GameContainer>
          <Solitaire
            theme={theme}
            options={{
              drawMode,
              scoringMode: 'standard',
              doubleClickEnabled: true,
              sound: {
                enabled: soundEnabled,
                volume: 0.5,
                sounds: {
                  victory: '/sounds/tada.mp3',
                },
              },
            }}
            onWin={handleWin}
            newGameTrigger={newGameTrigger}
            scale={1.2}
            showTestButton={showDebugControls}
          />
        </GameContainer>
        
        {/* Settings Panel */}
        <SettingsPanel $isOpen={settingsOpen}>
          <SettingsHeader>
            <span>Select Card Back</span>
            <CloseButton onClick={() => setSettingsOpen(false)}>X</CloseButton>
          </SettingsHeader>
          <CardBackSelector
            selected={cardBack}
            onSelect={handleCardBackChange}
            basePath="/cards"
          />
        </SettingsPanel>
        
        {winStats && (
          <WinMessage>
            <WinTitle>🎉 Congratulations!</WinTitle>
            <WinStats>
              <p>Time: {formatTime(winStats.time)}</p>
              <p>Moves: {winStats.moves}</p>
              <p>Score: {winStats.score}</p>
            </WinStats>
            <Button onClick={() => handleNewGame(true)}>
              Play Again
            </Button>
          </WinMessage>
        )}
      </AppContainer>
    </>
  );
}

export default App;
