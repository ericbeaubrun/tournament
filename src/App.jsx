import {HTML5Backend} from "react-dnd-html5-backend";
import {DndProvider} from "react-dnd";
import HomePage from "./homepage/HomePage.jsx";


// in your JSX
const App = () => {
    return (
        <DndProvider backend={HTML5Backend}>
                <HomePage/>
        </DndProvider>
    );
};

export default App;
