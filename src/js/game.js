let fieldSides;
let numberOfMines;

window.addEventListener('DOMContentLoaded',()=> {
    fieldSides=20
    numberOfMines=(fieldSides**2/5).toFixed(0) 
    generateMinefield()
    plantMines()
});

function generateMinefield(){
    const mfield=document.querySelector('.minefield')
    mfield.style.gridTemplateRows=`repeat(${fieldSides},20px)`
    mfield.style.gridTemplateColumns=`repeat(${fieldSides},20px)`    
    for(let i=0;i<fieldSides;i++){
        for(let j=0;j<fieldSides;j++){
            let cell=document.createElement('div')
            cell.classList.add(`f${i}-${j}`)
            cell.classList.add('field')
            cell.classList.add('hide')
            cell.addEventListener('click', e=>stepOnField(e.target))
            cell.addEventListener('contextmenu', e=>{
                toggleFlag(e.target)
                e.preventDefault()
            })
            mfield.appendChild(cell)
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function plantMines(){
    let i=0
    while (i < numberOfMines) {        
        let pos=`f${getRandomInt(0,fieldSides)}-${getRandomInt(0,fieldSides)}`
        let ff=document.querySelector(`.${pos}`)
        if(!ff.classList.contains('mine')){
            ff.classList.add('mine')
            i++
        }
    }
}

function stepOnField(f){
    if(f.classList.contains('mine')) stepOnMine(f)
    else{
        f.classList.remove('flag')
        checkNeighbors(f)
    }
    checkIfWin()
}

function toggleFlag(f){
    if(f.classList.contains('hide')){
        f.classList.toggle('flag')
        if(f.classList.contains('flag'))
            checkIfWin()
    }
}

function unhideAll(){
    let fields=document.querySelectorAll('.field')
    for(f of fields){
        f.classList.remove('hide','flag')
    }
}

function stepOnMine(){
    unhideAll()
    console.log('You have lost...')
}

function checkIfWin(){
    let countHide=document.querySelectorAll('.hide')
    let countFlag=document.querySelectorAll('.flag')
    if(countHide.length==numberOfMines && countFlag.length==numberOfMines){
        unhideAll()
        console.log("You have won!")
    }
}

function coordFromClass(f){
    let cor=f.classList[0].match(/(\d+)-(\d+)/);
    return [parseInt(cor[1]),parseInt(cor[2])]
}

function getNeighbors(f){
    const ar=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
    let cor=coordFromClass(f)
    return ar.map(d=>{
        let x=cor[0]+d[0]
        let y=cor[1]+d[1]
        if((x>=0 && x<fieldSides) && (y>=0 && y<fieldSides)){
            return `.f${x}-${y}`
        }
    }).filter(f=> f!==undefined)
}

function checkNeighbors(f){
    if(!f.classList.contains('hide') || f.classList.contains('flag')) return false
    let mine=0
    let res=[]
    let nn=getNeighbors(f)
    for(n of nn){
        let sfield=document.querySelector(n)
        if(sfield.classList.contains('mine')) mine++
        else res.push(sfield)
    }
    f.classList.remove('hide')
    if(mine>0) f.textContent=mine
    else if(res.length>0) res.map(checkNeighbors)
}

