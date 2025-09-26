import React from 'react';
import Dragula from 'dragula';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import './Board.css';

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    const clients = this.getClients();
    this.state = {
      clients: {
        backlog: clients.filter(client => !client.status || client.status === 'backlog'),
        inProgress: clients.filter(client => client.status && client.status === 'in-progress'),
        complete: clients.filter(client => client.status && client.status === 'complete'),
      }
    }
    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    }
    
    this.nextKey = null;
  }
  getClients() {
    return [
      ['1','Stark, White and Abbott','Cloned Optimal Architecture', 'in-progress'],
      ['2','Wiza LLC','Exclusive Bandwidth-Monitored Implementation', 'complete'],
      ['3','Nolan LLC','Vision-Oriented 4Thgeneration Graphicaluserinterface', 'backlog'],
      ['4','Thompson PLC','Streamlined Regional Knowledgeuser', 'in-progress'],
      ['5','Walker-Williamson','Team-Oriented 6Thgeneration Matrix', 'in-progress'],
      ['6','Boehm and Sons','Automated Systematic Paradigm', 'backlog'],
      ['7','Runolfsson, Hegmann and Block','Integrated Transitional Strategy', 'backlog'],
      ['8','Schumm-Labadie','Operative Heuristic Challenge', 'backlog'],
      ['9','Kohler Group','Re-Contextualized Multi-Tasking Attitude', 'backlog'],
      ['10','Romaguera Inc','Managed Foreground Toolset', 'backlog'],
      ['11','Reilly-King','Future-Proofed Interactive Toolset', 'complete'],
      ['12','Emard, Champlin and Runolfsdottir','Devolved Needs-Based Capability', 'backlog'],
      ['13','Fritsch, Cronin and Wolff','Open-Source 3Rdgeneration Website', 'complete'],
      ['14','Borer LLC','Profit-Focused Incremental Orchestration', 'backlog'],
      ['15','Emmerich-Ankunding','User-Centric Stable Extranet', 'in-progress'],
      ['16','Willms-Abbott','Progressive Bandwidth-Monitored Access', 'in-progress'],
      ['17','Brekke PLC','Intuitive User-Facing Customerloyalty', 'complete'],
      ['18','Bins, Toy and Klocko','Integrated Assymetric Software', 'backlog'],
      ['19','Hodkiewicz-Hayes','Programmable Systematic Securedline', 'backlog'],
      ['20','Murphy, Lang and Ferry','Organized Explicit Access', 'backlog'],
    ].map(companyDetails => ({
      id: companyDetails[0],
      name: companyDetails[1],
      description: companyDetails[2],
      status: companyDetails[3],
    }));
  }

  renderSwimlane(name, clients, ref) {
    return (
      <Swimlane name={name} clients={clients} dragulaRef={ref}/>
    );
  }

 
  
  componentDidMount(){    
      
       Dragula([ this.swimlanes.backlog.current, this.swimlanes.inProgress.current, this.swimlanes.complete.current ],
         {
         accepts: (el, target, source) =>   {
                if( target === this.swimlanes.backlog.current &&  source === this.swimlanes.inProgress.current ) {
                  return false;
                }
                
                if( target === this.swimlanes.backlog.current && source === this.swimlanes.complete.current  ){
                  return false;
                }

                if( target === this.swimlanes.inProgress.current && source ===  this.swimlanes.complete.current ){
                  return false;
                }                
                
                if( target === this.swimlanes.complete.current && source === this.swimlanes.backlog.current ){
                  return false;
                }

                return true;                
             }
       
        }
        )
          .on('drop',(el, target, source, sibling)=>
            {
              const swimlaneColumn = el.closest(".Swimlane-column");
              if (!swimlaneColumn) return; // for Safeguard

              const titleElement = swimlaneColumn.querySelector(".Swimlane-title");
              if (!titleElement) return; // for Safeguard

              const newStatus = titleElement.textContent.trim();
              
              const id = el.dataset.id;
              const status = el.dataset.status;

              
              if( target !== source ){
                  el.remove()
                  this.setState( prevState =>{
                      
                    
                      const clients = {
                          backlog: [...prevState.clients.backlog],
                          inProgress: [...prevState.clients.inProgress],
                          complete: [...prevState.clients.complete],
                      };

                      let sourceClientGroup;
                     

                      //find the source group that card belongs to
                       if (status === 'in-progress') {
                          sourceClientGroup = clients.inProgress;
                        } else if (status === 'complete') {
                          sourceClientGroup = clients.complete;
                        } else {
                          sourceClientGroup = clients.backlog;
                        }
                       
                   
                      //find the client to be updated
                        const clientToUpdate = sourceClientGroup.find( client => client.id === id );
                        if (!clientToUpdate) return { clients }; // Safety check
                        
                      //changing the status of the client
                       let targetGroup;
                      if( newStatus === 'In Progress' ){
                       
                          clientToUpdate.status = 'in-progress';         
                          targetGroup = [ ...clients.inProgress ]                              
                          clients.inProgress = targetGroup;                         
                          clients.backlog = sourceClientGroup;
                          
                      }else if( newStatus === 'Complete'){             

                            clientToUpdate.status = 'complete';                       
                            targetGroup = [ ...clients.complete]                            
                            clients.complete = targetGroup;                                                                 
                            clients.inProgress = sourceClientGroup;                           
                          
                        }       

                        //remove the moved card from the source                       
                        sourceClientGroup = sourceClientGroup.filter( client =>  client.id !== clientToUpdate.id );
                        
                                               
                        
                         let siblingIndex;
                         siblingIndex = sibling
                            ? Array.from(target.children).indexOf(sibling)
                            : targetGroup.length; // append at end if no sibling
                         
                         if( targetGroup) {
                              targetGroup.splice(siblingIndex, 0, clientToUpdate);
                          }                          
                                            
                                                   
                      
                    return {
                      clients 
                    };                   

                  })
                }             
          })     
  }


  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.renderSwimlane('Backlog', this.state.clients.backlog, this.swimlanes.backlog)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('In Progress', this.state.clients.inProgress, this.swimlanes.inProgress)}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane('Complete', this.state.clients.complete, this.swimlanes.complete)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
