import React from 'react';
import ReactDOM from 'react-dom';

export class AnimatedList extends React.Component {
    constructor(props) {
        super(props);

        this.refLookup = {};
        this.rects = {};
    }

    componentWillReceiveProps() {
        this.props.data.forEach((item) => {
            const ref = this.refLookup[this.props.getKey(item)];
            const domNode = ReactDOM.findDOMNode(ref);

            if (!domNode) return;

            this.rects[this.props.getKey(item)] = domNode.getBoundingClientRect();
        });
    }

    componentDidUpdate(previousProps) {
        previousProps.data.forEach( item => {
            let domNode = ReactDOM.findDOMNode( this.refLookup[this.props.getKey(item)] );

            if (!domNode) return;
        
            const newBox = domNode.getBoundingClientRect();
            const oldBox = this.rects[this.props.getKey(item)];
            
            const deltaX = oldBox.left - newBox.left; 
            const deltaY = oldBox.top  - newBox.top;
        
            requestAnimationFrame(() => {
              domNode.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
              domNode.style.transition = 'transform 0s';  

              requestAnimationFrame(() => {
                domNode.style.transform  = '';
                domNode.style.transition = 'transform 500ms';
              });
            });
          });
    }
    
    getRefSetter(key) {
        return (ref) => {
            this.refLookup[key] = ref;
        }
    }

    render() {
        return (
            <React.Fragment>
                {
                    this.props.data.map((item) => {
                        return this.props.Item({ ...item, ref: this.getRefSetter(this.props.getKey(item)) });
                    })
                }
            </React.Fragment>
        );
    }
}