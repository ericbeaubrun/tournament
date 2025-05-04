import React from "react";
import "./TabNavigation.scss";

/**
 * Composant de navigation par onglets
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.activeTab - L'onglet actuellement actif
 * @param {Function} props.setActiveTab - Fonction pour changer l'onglet actif
 * @param {Array} props.tabs - Liste des onglets à afficher
 * @returns {JSX.Element} Le composant TabNavigation
 */
const TabNavigation = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="history-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
