
import React, { useEffect, useState } from 'react';
import styles from "../styles/dragMove.module.css";

export default function DragMove(props) {
    const {onDragMove,children,onPointerDown,onPointerUp,showNextBtn,showPrevBtn,
            nextBtnClickHandler,prevBtnClickHandler,className,isMouseEventReq,style,isClassValidationReq}=props
    const [isDragging,setIsDragging]=useState(false);

    const handlePointerUp=(e)=>{
        if(isClassValidationReq){
            if(e.target.classList.contains(styles.dragMoveCont)){
                setIsDragging(false);
                if(onPointerUp) onPointerUp(e);
            }
        }
        else{
            setIsDragging(false);
            if(onPointerUp) onPointerUp(e);
        }
        
    }

    const handlePointerDown=(e)=>{
        if(isClassValidationReq){
            if(e.target.classList.contains(styles.dragMoveCont)){
                setIsDragging(true);
                if(onPointerDown) onPointerDown(e);
            }
        }
        else{
            setIsDragging(true);
            if(onPointerDown) onPointerDown(e);
        }
    }
    const handlePointerMove=(e)=>{
        if(isDragging && onDragMove) onDragMove(e)
    }
    const handleMouseUp=(e)=>{
        if(isMouseEventReq) handlePointerUp(e);
    }
    const handleMouseDown=(e)=>{
        if(isMouseEventReq) handlePointerDown(e);

    }
    const handleMouseMove=(e)=>{
        if(isMouseEventReq) handlePointerMove(e);
    }

    

    useEffect(()=>{
        window.addEventListener("touchend",handlePointerUp);
        window.addEventListener("mouseleave",handleMouseUp);
        window.addEventListener("mouseup",handleMouseUp);
        return ()=>{
            window.removeEventListener("touchend",handlePointerUp);
            window.removeEventListener("mouseleave",handleMouseUp);
            window.removeEventListener("mouseup",handleMouseUp);
        };
    })

  return (
      <div  onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} className={`${styles.dragMoveCont} ${className??""}`}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} style={style}>
        {showPrevBtn && 
            <button type="button" className={styles.leftScrollBtn} onClick={prevBtnClickHandler}>
                <i className="fas fa-chevron-left"></i>
            </button>
        }
        {children}
        {showNextBtn && 
            <button type="button" className={styles.rightScrollBtn} onClick={nextBtnClickHandler}>
                <i className="fas fa-chevron-right"></i>
            </button>
        }
      </div>
  )
}
