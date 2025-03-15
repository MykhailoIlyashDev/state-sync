/**
 * StateSync - Легка система управління станом для фронтенду (50 рядків)
 * Дозволяє синхронізувати стан між компонентами без залежностей
 */
const StateSync = (() => {
  // Приватне сховище для станів
  const stores = {};
  const listeners = {};
  const derivedStates = {};
  
  // Функція для створення нового сховища
  const createStore = (name, initialState = {}) => {
    if (stores[name]) return stores[name];
    
    stores[name] = { ...initialState };
    listeners[name] = new Set();
    
    return {
      // Отримати поточний стан або його частину
      get: (path) => path ? getNestedValue(stores[name], path) : { ...stores[name] },
      
      // Оновити стан (частково або повністю)
      set: (updater, options = {}) => {
        const prevState = { ...stores[name] };
        const nextState = typeof updater === 'function' 
          ? updater(prevState) 
          : { ...prevState, ...updater };
        
        stores[name] = nextState;
        
        // Не сповіщати, якщо silent: true
        if (!options.silent) {
          listeners[name].forEach(listener => listener(nextState, prevState));
        }
        
        // Оновити похідні стани
        Object.keys(derivedStates).forEach(key => {
          if (derivedStates[key].deps.includes(name)) {
            derivedStates[key].update();
          }
        });
        
        return nextState;
      },
      
      // Підписатися на зміни
      subscribe: (callback) => {
        listeners[name].add(callback);
        return () => listeners[name].delete(callback);
      },
      
      // Прив'язати стан до DOM елемента
      bind: (selector, options = {}) => {
        const elements = typeof selector === 'string' 
          ? document.querySelectorAll(selector) 
          : [selector];
        
        elements.forEach(el => {
          const render = () => {
            const value = options.transform 
              ? options.transform(stores[name]) 
              : JSON.stringify(stores[name], null, 2);
            
            if (options.attr) el.setAttribute(options.attr, value);
            else if (options.prop) el[options.prop] = value;
            else el.textContent = value;
          };
          
          render(); // Початковий рендер
          return listeners[name].add(render); // Підписка на зміни
        });
      }
    };
  };
  
  // Створити похідний стан на основі інших сховищ
  const derive = (name, deps, computeFn) => {
    const store = createStore(name);
    
    const update = () => {
      const inputs = deps.map(dep => stores[dep]);
      const newState = computeFn(...inputs);
      store.set(newState, { silent: false });
    };
    
    derivedStates[name] = { deps, update };
    update(); // Початкове обчислення
    
    return store;
  };
  
  // Допоміжна функція для отримання вкладених значень
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, key) => o?.[key], obj);
  };
  
  return { createStore, derive };
})();

// Експорт як модуль або глобальний об'єкт
typeof module !== 'undefined' ? module.exports = StateSync : window.StateSync = StateSync;
