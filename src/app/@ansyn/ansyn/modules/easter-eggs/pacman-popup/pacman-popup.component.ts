import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy, AfterViewInit } from '@angular/core';
import { KeysListenerService } from "../../core/services/keys-listener.service";
import { AutoSubscription, AutoSubscriptions } from "auto-subscriptions";
import { filter, tap } from "rxjs/operators";
import { PacnManModeAction } from "../../status-bar/actions/status-bar.actions";
import { Store } from "@ngrx/store";

export enum KEY_CODE {
	RIGHT_ARROW = 39,
	LEFT_ARROW = 37,
	DOWN_ARROW = 40,
	UP_ARROW = 38
}

class Ghost {
	className: string;
	startIndex: number;
	speed: number;
	currentIndex: number;
	previousIndex: number;
	isScared: boolean;
	timerId: number;

	constructor(className, startIndex, speed) {
		this.className = className;
		this.startIndex = startIndex;
		this.speed = speed;
		this.currentIndex = startIndex;
		this.previousIndex = startIndex;
		this.isScared = false,
		this.timerId = NaN
	}
}

@Component({
	selector: 'ansyn-pacman-popup',
	templateUrl: './pacman-popup.component.html',
	styleUrls: ['./pacman-popup.component.less']
})
@AutoSubscriptions()
export class PacmanPopupComponent implements OnInit, OnDestroy, AfterViewInit {

	title = 'angular-pacman';
	width = 28;
	scoreValue = 0;

	// layout
	// legend
	// 0 - pac dot
	// 1 wall
	// 2 - ghost lair
	// 3 - power pellet
	// 4 - empty
	layout = [
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
		1, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 3, 1,
		1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
		1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 2, 2, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
		4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4,
		1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
		1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
		1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
		1, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 1,
		1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
		1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
		1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
		1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
		1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
		1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
	]

	squares = [];
	pacmanCurrentIndex = 490;
	// define all the 4 ghosts
	ghosts = [
		new Ghost('blinky', 348, 150),
		new Ghost('pinky', 376, 200),
		new Ghost('inky', 351, 120),
		new Ghost('clyde', 379, 300)
	]

	@ViewChild('grid') grid: ElementRef;
	@ViewChild('score') score: ElementRef;
	@ViewChild('result') result: ElementRef;
	isPacmanAlive = true;

	constructor(private renderer: Renderer2,
				public keyListenerService: KeysListenerService,
				private elem: ElementRef,
				protected store$: Store<any>) {

	}

	/**
	 * Actively listen to the keyup event in order to move the pacman
	 */
	@AutoSubscription
	KeyUpEvent$ = () => this.keyListenerService.keyup.pipe(
		filter(() => this.isPacmanAlive),
		tap($event => {
			this.renderer.removeClass(this.squares[this.pacmanCurrentIndex], 'pac-man');
			if ($event.keyCode === KEY_CODE.RIGHT_ARROW) {
				if (
					this.pacmanCurrentIndex - this.width >= 0 &&
					!this.squares[this.pacmanCurrentIndex + 1].classList.contains('wall') &&
					!this.squares[this.pacmanCurrentIndex + 1].classList.contains('ghost-lair')
				) {
					this.pacmanCurrentIndex += 1
				}
				if (this.squares[this.pacmanCurrentIndex + 1] === this.squares[392]) {
					this.pacmanCurrentIndex = 364
				}
			}

			if ($event.keyCode === KEY_CODE.LEFT_ARROW) {
				if (
					this.pacmanCurrentIndex % this.width !== 0 &&
					!this.squares[this.pacmanCurrentIndex - 1].classList.contains('wall') &&
					!this.squares[this.pacmanCurrentIndex - 1].classList.contains('ghost-lair')
				) {
					this.pacmanCurrentIndex -= 1
				}
				if (this.squares[this.pacmanCurrentIndex - 1] === this.squares[363]) {
					this.pacmanCurrentIndex = 391
				}
			}

			if ($event.keyCode === KEY_CODE.DOWN_ARROW) {
				if (
					this.pacmanCurrentIndex + this.width < this.width * this.width &&
					!this.squares[this.pacmanCurrentIndex + this.width].classList.contains('wall') &&
					!this.squares[this.pacmanCurrentIndex + this.width].classList.contains('ghost-lair')
				) {
					this.pacmanCurrentIndex += this.width
				}
			}

			if ($event.keyCode === KEY_CODE.UP_ARROW) {
				if (
					this.pacmanCurrentIndex - this.width >= 0 &&
					!this.squares[this.pacmanCurrentIndex - this.width].classList.contains('wall') &&
					!this.squares[this.pacmanCurrentIndex - this.width].classList.contains('ghost-lair')
				) {
					this.pacmanCurrentIndex -= this.width
				}
			}
			this.renderer.addClass(this.squares[this.pacmanCurrentIndex], 'pac-man');
			this.pacDotEaten();
			this.powerPelletEaten();
			this.checkForGameOver(this.squares, this.pacmanCurrentIndex);
			this.checkforWin();
		}));


	/**
	 * Generate the 28x28 grid board
	 * Colour all the element with the array define on the layout
	 */
	createBoard() {
		for (let i = 0; i < this.layout.length; i++) {
			const square = this.renderer.createElement('div');
			this.renderer.appendChild(this.grid.nativeElement, square);
			this.squares.push(square)

			if (this.layout[i] === 0) {
				this.renderer.addClass(this.squares[i], 'pac-dot');
			} else if (this.layout[i] === 1) {
				this.renderer.addClass(this.squares[i], 'wall');
			} else if (this.layout[i] === 2) {
				this.renderer.addClass(this.squares[i], 'ghost-lair');
			} else if (this.layout[i] === 3) {
				this.renderer.addClass(this.squares[i], 'power-pellet');
			}
		}
	}

	ngOnInit(): void {
		this.store$.dispatch(new PacnManModeAction(true));
	}

	ngOnDestroy(): void {
		this.store$.dispatch(new PacnManModeAction(false));
	}

	// init all the ghosts from the array
	// set interval to move the ghost around.
	initGhosts() {
		this.ghosts.forEach(ghost => {
			this.squares[ghost.currentIndex].classList.add('ghost');
			this.squares[ghost.currentIndex].classList.add(ghost.className);
			this.moveGhost(ghost);
		});

	}

	/**
	 * Randomly move the ghost
	 * Check whether those ghost are afraid of the pacman
	 * Anti collision
	 * @param ghost
	 */
	moveGhost(ghost) {
		// please implement this.
		let widthX = this.width;
		let squaresY = this.squares;
		let scoreValX = this.scoreValue;
		let pacmanCurrentIndexX = this.pacmanCurrentIndex;
		let checkForGameOverX = this.checkForGameOver;
		ghost.timerId = setInterval(function () {
			const directions = [-1, +1, +widthX, -widthX];
			let direction = directions[Math.floor(Math.random() * directions.length)];
			if (!squaresY[ghost.currentIndex + direction].classList.contains('ghost') &&
				!squaresY[ghost.currentIndex + direction].classList.contains('wall')
			) {
				squaresY[ghost.currentIndex].classList.remove(ghost.className);
				squaresY[ghost.currentIndex].classList.remove('ghost', 'scared-ghost');
				ghost.currentIndex += direction
				ghost.previousIndex = ghost.currentIndex;
				squaresY[ghost.currentIndex].classList.add(ghost.className, 'ghost');
			} else {
				direction = directions[Math.floor(Math.random() * directions.length)];
			}
			if (ghost.isScared) {
				squaresY[ghost.currentIndex].classList.add('scared-ghost')
			}

			if (ghost.isScared && squaresY[ghost.currentIndex].classList.contains('pac-man')) {
				squaresY[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost')
				ghost.currentIndex = ghost.startIndex
				scoreValX += 100
				squaresY[ghost.currentIndex].classList.add(ghost.className, 'ghost')
			}
			checkForGameOverX(squaresY, pacmanCurrentIndexX);
		}, ghost.speed);
	}

	/**
	 * Check whether the game is over. if the pacman touches the ghost when it is not isScared
	 * then end the game by removing the keyUp event from the window/document.
	 */
	checkForGameOver(squaresX, pacmanCurrentIndexX) {
		if (squaresX[pacmanCurrentIndexX].classList.contains('ghost') &&
			!squaresX[pacmanCurrentIndexX].classList.contains('scared-ghost')
		) {
			this.ghosts.forEach(ghost => clearInterval(ghost.timerId));
			this.isPacmanAlive = false;
			this.result.nativeElement.innerHTML = "Game Over!";
		}

	}


	/**
	 * Check whether has pacman consume all the pellet from the grid
	 * if yes then display the winning message
	 */
	checkforWin() {
		if (this.scoreValue === 274) {
			this.ghosts.forEach(ghost => clearInterval(ghost.timerId));
			this.isPacmanAlive = false;
			this.result.nativeElement.innerHTML = "You have Won!";
		}
	}

	/**
	 * Initialize the board by generating 28x28 grid
	 * Render the initial start position of the pacman
	 * Also render the all the ghosts within the array list
	 */
	ngAfterViewInit() {
		// create the pac man board
		this.createBoard();
		this.renderer.addClass(this.squares[this.pacmanCurrentIndex], 'pac-man');
		this.initGhosts();
	}

	/**
	 * What happens when pacman is busy eating the small pellet
	 * Increment the score
	 * Remove the small pellet from the grid once is consume by pacman
	 */
	pacDotEaten() {
		if (this.squares[this.pacmanCurrentIndex].classList.contains('pac-dot')) {
			this.scoreValue++
			this.score.nativeElement.innerHTML = this.scoreValue;
			this.squares[this.pacmanCurrentIndex].classList.remove('pac-dot');
		}
	}

	/**
	 * Once pacman consume the power pellet it gain super power
	 * All the ghost will be afraid of em.
	 * By right the ghost should run away from pacman as much as possible
	 * Set an timeout for the ghost to turn back to hunting mode rather than
	 * scare of pacman.
	 */
	powerPelletEaten() {
		if (this.squares[this.pacmanCurrentIndex].classList.contains('power-pellet')) {
			this.scoreValue += 10
			this.score.nativeElement.innerHTML = this.scoreValue;
			this.ghosts.forEach(ghost => {
				ghost.isScared = true;
				console.log("turn to scared of pacman");
				// turn the ghost colour to aquamarine.
				this.squares[ghost.currentIndex].classList.add(ghost.className, 'ghost', 'scared-ghost');
			});
			setTimeout(() => {
				this.ghosts.forEach(ghost => {
					ghost.isScared = false
					this.squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost')
					ghost.currentIndex = ghost.startIndex
					this.squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
				})
			}, 10000)
			this.squares[this.pacmanCurrentIndex].classList.remove('power-pellet');
		}
	}
}

