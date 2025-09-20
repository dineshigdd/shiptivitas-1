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
  
       Dragula([ this.swimlanes.backlog.current, this.swimlanes.inProgress.current, this.swimlanes.complete.current ])
        
          .on('drop',(el )=>
            {
              const id = el.dataset.id ;
              const status = el.dataset.status;
              
              if(el.parentElement.parentElement.firstChild.textContent){
                //  const newStatus = el.parentElement.parentElement.firstChild.textContent;
                const newStatus = el.closest(".Swimlane-column").querySelector(".Swimlane-title").textContent.trim();         

                
                  this.setState( prevState =>{
                      
                      const updatedClients = {
                          backlog: [...prevState.clients.backlog],
                          inProgress: [...prevState.clients.inProgress],
                          complete: [...prevState.clients.complete],
                      };

                      let sourceClientGroup = [];
                      //find the source grop that card belongs to
                      if( status === 'in-progress'){
                        // sourceClientGroup = [... updatedClients[ 'inProgress' ]];
                        sourceClientGroup = updatedClients.inProgress;
                      }else{
                        sourceClientGroup =  updatedClients[ status ] ;
                      }
                    //find the client to update
                      // const clientToUpdate = { ... Object.values( sourceClientGroup ).find( client => client.id === id )  }        
                        const clientToUpdate = sourceClientGroup.find( client => client.id === id );
                        
                      if( newStatus === 'In Progress'){
                          clientToUpdate.status = 'in-progress';
                                                
                          // const nextKey = Object.keys( updatedClients[ 'inProgress' ]).length;    
                        
                          const targetGroup = [ ...updatedClients[ 'inProgress' ]]
                          targetGroup[ nextKey ]= clientToUpdate;                                     
                          // updatedClients[ 'inProgress' ].push(  targetGroup[ nextKey ] )                       
                        
                           updatedClients[ 'inProgress' ] = targetGroup;
                           console.log(  updatedClients[ 'inProgress' ] )
                      }else{                                            
                      
                          clientToUpdate.status = newStatus.toLocaleLowerCase();
                      }                                                                      

                      //to do://remove the client from old group
                         
                          sourceClientGroup = sourceClientGroup.filter( client =>  client.id !== clientToUpdate.id ) ;
                          const sourceKey =  updatedClients[ status ].length;    


                          updatedClients[ status ] = sourceClientGroup;
                          console.log(  updatedClients[ status ]  )
                      
                      // // Put it back into the group
                      // updatedClientGroup[ el.dataset.id ] = clientToUpdate;

                      // // Put the group back into the clients object
                      // updatedClients[el.dataset.status] = updatedClientGroup;
                      
                      
                    return {
                      clients: updatedClients
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
