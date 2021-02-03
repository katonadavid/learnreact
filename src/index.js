import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

  function Square(props) {
    return (
      <button className="square" onClick={props.onClick}>
        { props.value }
      </button>
    )
  }
  
  class Board extends React.Component {

    renderSquare(i) {
      return (
              <Square
              value={this.props.squares[i]} 
              onClick={ () => this.props.onClick(i) }
              />
      );
    }
  
    render() {
      let boardSquares = [];

      for( let row = 0; row < 3; row++ ) {
        
        let boardRow = [];

        for( let col = 0; col < 3; col++ ) {
          const squareIndex = ( row * 3 ) + col;
          boardRow.push(
            <span key={ squareIndex } className={ (this.props.winnerTrio && this.props.winnerTrio.includes( squareIndex ) ? 'winner-square' : '' ) } >
              { this.renderSquare( (row * 3) + col) }
            </span> );
        }
        boardSquares.push( <div className="board-row" key={row}> { boardRow } </div> );

      }

      return (
        <div>
          {boardSquares}
        </div>
      );
    }
  }
  
  class Game extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        history: [{
          squares: Array(9).fill(null)
        }],
        xIsNext: true,
        currentStep: 0,
        sortAsc: true
      }
    }

    render() {

      const history = this.state.history;
      const currentBoard = history[ this.state.currentStep ];
      const winnerTrio = calculateWinner( currentBoard.squares );
    
      const moves = history.map( ( step, move ) => {
        const desc = move? `Go to move #${move} ( ${step.col}, ${step.row} )`:
        'Go to game start';
        return (
          <li key={ move }>
            <button className={ move === this.state.currentStep ? 'current-step' : '' } onClick={ () => this.jumpTo(move) }>{ desc }</button>
          </li>
        );
      });

      let status;

      if(winnerTrio) {
        status = 'Winner: ' + currentBoard.squares[ [ winnerTrio[0] ] ];
      } else if( checkForDraw( currentBoard.squares ) ) {
        status = 'It\'s a Draw!';
      } else {
        status = 'Next player: ' + (this.state.xIsNext? 'X' : 'O');
      }

      return (
        <div className="game">
          <div className="game-board">
            <Board squares={currentBoard.squares}
            onClick={ (i)=> this.handleClick(i) }
            winnerTrio={ winnerTrio }
            />
          </div>
          <div className="game-info">
            <div>{ status }</div>
            <br/>
            <div>
              <span style={{ marginRight : '1rem' }}>Moves</span>
              <button onClick={ () => { this.toggleSort() } }>
                {
                  this.state.sortAsc ? 'Sort descending' : 'Sort ascending'
                }
              </button>
            </div>
            <ol>{  this.state.sortAsc ? moves : moves.reverse() }</ol>
          </div>
        </div>
      );
    }

    toggleSort() {
      this.setState({
        sortAsc: !this.state.sortAsc
      });
    }

    jumpTo( step ) {
      this.setState({
        currentStep: step,
        xIsNext: (step % 2 ) === 0
      });
    }

    handleClick(i) {
      // We cut off all the steps that happened after the current one
      const history = this.state.history.slice(0, this.state.currentStep + 1);
      const currentBoard = history[ history.length -1 ];
      // Making copy of squares
      const squares = currentBoard.squares.slice();

      // Return if we have a winner or if the square already has a value 
      if( calculateWinner( squares ) || squares[i] ) {
        return;
      }

      // Assigning a new value to the clicked square
      squares[i] = this.state.xIsNext ? 'X' : 'O';

      // Determine col and row from square index
      const col = ( i % 3 ) + 1;
      const row = Math.ceil( ( i + 1 ) / 3 );

      // Updating state of game
      this.setState({
        // We assign a newly created array to history by concating the new square array
        // Push would mutate our history array, concat return a new one
        history: history.concat([{
          squares: squares,
          col: col,
          row: row
        }]),
        currentStep: history.length,
        xIsNext: !this.state.xIsNext
      });
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return [ a, b, c ];
      }
    }
    return null;
  }

  function checkForDraw(squares) {
    return squares.indexOf( null ) === -1;
  }