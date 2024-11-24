import Tournament from "./Tournament.jsx";
import {HTML5Backend} from "react-dnd-html5-backend";
import Description from "./Description.jsx";
import {DndProvider} from "react-dnd";

const App = () => {
    return (
        <DndProvider backend={HTML5Backend}>
            <h1>Tournament Bracket</h1>
            <Description/>
            <Tournament/>
        </DndProvider>
    );
};

export default App;

