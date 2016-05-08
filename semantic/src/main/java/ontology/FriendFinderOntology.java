package ontology;

import java.util.ArrayList;
import java.util.HashMap;

import org.apache.jena.ontology.Individual;
import org.apache.jena.ontology.OntClass;
import org.apache.jena.ontology.OntModel;
import org.apache.jena.ontology.OntProperty;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.sparql.vocabulary.FOAF;

import models.Campus;
import models.Location;
import models.User;
import models.World;

public class FriendFinderOntology {

	public static OntModel om;

	private static OntClass sensingDeviceClass;
	private static OntClass mobileClass;
	private static OntClass campusClass;
	private static OntClass platformClass;
	private static OntClass locationClass;
	private static OntClass deploymentClass;
	private static OntClass beaconClass;

	private static OntProperty reqFriendsWith;
	private static OntProperty hasDevice;

	private static String NS;
	private static String SSN;

	private static HashMap<User, Individual> userMap = new HashMap<User, Individual>();
	private static HashMap<Campus, Individual> campusMap = new HashMap<Campus, Individual>();
	private static HashMap<Location, Individual> locationMap = new HashMap<Location, Individual>();
	private static HashMap<String, Individual> beaconMap = new HashMap<String, Individual>();

	public static void createIndividuals(World world) {
		createOntology();
		createCampusIndividuals(world.campuses);
		createLocationIndividuals(world.locations);
		createUserIndividuals(world.users);
	}

	public static void createOntology() {
		om = ModelFactory.createOntologyModel();
		NS = "http://met.guc.edu.eg/friend-finder#";
		SSN = "http://purl.oclc.org/NET/ssnx/ssn#";

		om.setNsPrefix("metff", NS);
		om.setNsPrefix("foaf", FOAF.NS);
		om.setNsPrefix("SSN", SSN);

		sensingDeviceClass = om.createClass(SSN + "SensingDevice");
		mobileClass = om.createClass(NS + "MobilePhone");
		campusClass = om.createClass(NS + "Campus");
		platformClass = om.createClass(SSN + "Platform");
		locationClass = om.createClass(NS + "Location");
		deploymentClass = om.createClass(SSN + "Deployment");
		beaconClass = om.createClass(NS + "Beacon");

		mobileClass.addSuperClass(sensingDeviceClass);
		beaconClass.addSuperClass(deploymentClass);
		locationClass.addSuperClass(platformClass);

		reqFriendsWith = om.createOntProperty(NS + "RequestsFriendshipWith");
		hasDevice = om.createOntProperty(NS + "HasDevice");

		om.add(FOAF.Person, reqFriendsWith, FOAF.Person);
		om.add(FOAF.Person, FOAF.knows, FOAF.Person);
		om.add(FOAF.Person, hasDevice, mobileClass);
		om.add(FOAF.Person, FOAF.based_near, locationClass);

		mobileClass.addProperty(FOAF.based_near, beaconClass);
		locationClass.addProperty(FOAF.based_near, campusClass);
		beaconClass.addProperty(FOAF.based_near, locationClass);

		//om.write(System.out);
	}

	public static void createCampusIndividuals(ArrayList<Campus> campuses) {
		for (int i=0; i<campuses.size(); i++) {
			Campus campus = campuses.get(i);
			Individual campusIndividual = campusClass.createIndividual(NS + "campus" + i);
			campusMap.put(campus, campusIndividual);
			campusIndividual.addProperty(FOAF.name, campus.name);
		}
	}

	public static void createLocationIndividuals(ArrayList<Location> locations) {
		for (int i=0; i<locations.size(); i++) {
			Location location = locations.get(i);
			Individual locationIndividual = locationClass.createIndividual(NS + "location" + i);
			locationMap.put(location, locationIndividual);
			locationIndividual.addProperty(FOAF.name, location.name);
			locationIndividual.addProperty(FOAF.based_near, campusMap.get(location.campus));

			Individual beaconIndividual = beaconClass.createIndividual(NS + "beacon" + i);
			beaconMap.put(location.beacon, beaconIndividual);
			beaconIndividual.addProperty(FOAF.name, location.beacon);
			beaconIndividual.addProperty(FOAF.based_near, locationIndividual);
		}
	}

	public static void createUserIndividuals(ArrayList<User> users) {
		for (int i=0; i<users.size(); i++) {
			User user = users.get(i);
			Individual userIndividual = userMap.get(user);
			if(!userMap.containsKey(user)){
				userIndividual = om.createIndividual(FOAF.NS + "person" + userMap.size(), FOAF.Person);
				userMap.put(user, userIndividual);
				userIndividual.addProperty(FOAF.name, om.createLiteral(user.username));
			}
			for (int j=0; j<user.friends.size(); j++) {
				User friend = user.friends.get(j);
				if (!userMap.containsKey(friend)) {
					Individual friendIndividual = om.createIndividual(FOAF.NS + "person" + userMap.size(), FOAF.Person);
					userMap.put(friend, friendIndividual);
					friendIndividual.addProperty(FOAF.name, om.createLiteral(friend.username));
				}
				userIndividual.addProperty(FOAF.knows, userMap.get(friend));
			}

			for (int j=0; j<user.pendingOutgoingRequests.size(); j++) {
				User friend = user.pendingOutgoingRequests.get(j);
				if (!userMap.containsKey(friend)) {
					Individual friendIndividual = om.createIndividual(FOAF.NS + "person" + userMap.size(), FOAF.Person);
					userMap.put(friend, friendIndividual);
					friendIndividual.addProperty(FOAF.name, om.createLiteral(friend.username));
				}
				userIndividual.addProperty(reqFriendsWith, userMap.get(friend));
			}


            Individual mobileIndividual = mobileClass.createIndividual(NS + "mobile" + i);
            userIndividual.addProperty(hasDevice, mobileIndividual);

			if(user.locationHistory.size() > 0){
                Location latestLocation = user.locationHistory.get(0).time.after(user.locationHistory.get(user.locationHistory.size()-1).time)
                        ? user.locationHistory.get(0).location : user.locationHistory.get(user.locationHistory.size()-1).location;
                Individual locationIndividual = locationMap.get(latestLocation);
                userIndividual.addProperty(FOAF.based_near, locationIndividual);

                mobileIndividual.addProperty(FOAF.based_near, beaconMap.get(latestLocation.beacon));
			}


		}
	}

}