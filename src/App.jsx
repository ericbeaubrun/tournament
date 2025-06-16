import {HTML5Backend} from "react-dnd-html5-backend";
import {DndProvider} from "react-dnd";
import Home from "./components/Home.jsx";

const App = () => {
    return (
        <DndProvider backend={HTML5Backend}>
                <Home/>
        </DndProvider>
    );
};

export default App;
