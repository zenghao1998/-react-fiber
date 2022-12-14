const data = {
    item1: 'bb',
    item2: 'cc'
};
const my = {
    createElement: (type, poprs, ...childer) => {
        const t = childer.reduce((arr, item)=>{
            if(Array.isArray(item)){
                arr.push(...item)
            }else{
                arr.push(item)
            }
            return arr
        }, [])
        return {
            type,
            props: {
                ...poprs ? poprs : {},
                children: t.map(item => {
                    if (typeof item === 'object') {
                        return item;
                    } else {
                        return {
                            type: "TEXT",
                            props: {
                                nodeValue: item,
                                children: [],
                            },
                        }
                    }
                })
            }
        };
    }
};
const App = () => {
    return (
        <ui>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </ui>
    )
};
console.log(App())
function render(element, container) {
    let nextFiberReconcileWork = null;
    let wipRoot = null;
    function commitWork(fiber) {
        let f = fiber;
        while(f){
            let domParentFiber = f.return;
            if(f.dom){
                domParentFiber.dom.appendChild(f.dom);
            };
            if(f.child){
                f = f.child;
            }else{
                const wrapFun = () => {
                    let s = f;
                    while(s){
                        if(s.sibling){
                            f = s.sibling;
                            return;
                        };
                        s = s.return;
                    };
                    f = null;
                }
                wrapFun()
            }
        }
        // if (!fiber) {
        //     return
        // }
        // let domParentFiber = fiber.return
        // while (!domParentFiber.dom) {
        //     domParentFiber = domParentFiber.return
        // }
        // const domParent = domParentFiber.dom
        // if (
        //     fiber.effectTag === "PLACEMENT" &&
        //     fiber.dom != null
        // ) {
        //     domParent.appendChild(fiber.dom)
        // } 
        // commitWork(fiber.child)
        // commitWork(fiber.sibling)
    }
    function commitRoot() {
        commitWork(wipRoot.child);
    }
    function reconcileChildren(fiber, child) {
        let i = 0;
        let preSibing = null
        while (i < child.length) {
            const item = child[i]
            const newFiber = {
                return: fiber,
                sibling: null,
                child: null,
                type: item.type,
                props: item.props,
                effectTag: "PLACEMENT"
            };
            if (i === 0) {
                fiber.child = newFiber
            } else {
                preSibing.sibling = newFiber
            };
            preSibing = newFiber
            i++;
        }
    }
    const setAttribute = (dom, key, value) => {
        if (key === 'children') {
            return;
        }
        if (key === 'nodeValue') {
            dom.textContent = value;
        } else {
            dom.setAttribute(key, value);
        }
    };
    function createDom(fiber) {
        let dom = ''
        if(fiber.type == "TEXT"){
            dom = document.createTextNode(fiber.props.nodeValue);
        }else if(typeof fiber.type === 'function'){
            const isFunC = f => {
                let cFiber = f;
                if (typeof cFiber.type === 'function') {
                  return isFunC(cFiber.type(cFiber.props));
                } else {
                  return cFiber;
                }
              };
              const cFiber = isFunC(fiber)
              fiber.props = cFiber.props;
              dom = createDom(cFiber);
        }else{
            dom = document.createElement(fiber.type);
        }
        return dom;
    }
    function reconcile(fiber) {
        let _fiber = fiber;
        if (!_fiber.dom) {
            _fiber.dom = createDom(_fiber)
        };
        reconcileChildren(_fiber, _fiber.props.children)
    }
    function performNextWork(fiber) {
        reconcile(fiber);
        if (fiber.child) {
            return fiber.child;
        }
        let nextFiber = fiber;
        while (nextFiber) {
            if (nextFiber.sibling) {
                return nextFiber.sibling;
            }
            nextFiber = nextFiber.return;
        }
    }
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
    }
    nextFiberReconcileWork = wipRoot;
    function timeSlice(time){
        const p = (res) => {
            const start = performance.now();
            do{
                nextFiberReconcileWork = performNextWork(
                    nextFiberReconcileWork
                );
            }while (nextFiberReconcileWork && (performance.now() - start) <= time);
            if(!nextFiberReconcileWork)res()
            if(nextFiberReconcileWork){
                setTimeout(()=>{
                    p(res);
                });
            };
        }
        return new Promise(p)
    };
    const start = performance.now();
    timeSlice(5).then(()=>{
        if(!nextFiberReconcileWork){
            commitRoot(wipRoot);
            console.log((performance.now() - start) / 1000)
        };
    })
    
}
render(<App />, document.querySelector("#root"))
