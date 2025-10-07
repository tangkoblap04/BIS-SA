import { Link } from 'react-router-dom';
import { ClockIcon, UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

function CourseCard({ course }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
      <div className="relative">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-full text-sm">
          {course.role}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">
            {course.title}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-3">
            {course.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center text-gray-500">
              <UserIcon className="w-5 h-5 mr-2" />
              <span className="text-sm">วิทยากร: {course.instructor}</span>
            </div>

            <div className="flex items-center text-gray-500">
              <ClockIcon className="w-5 h-5 mr-2" />
              <span className="text-sm">ระยะเวลา: {course.duration}</span>
            </div>
          </div>
        </div>

        <Link 
          to={`/courses/${course.role}-1`}
          className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg 
                    hover:bg-blue-700 transition-colors duration-300 text-center 
                    font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:ring-offset-2 mt-6"
        >
          ดูรายละเอียด
        </Link>
      </div>
    </div>
  );
}

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    role: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    instructor: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired
  }).isRequired
};

export default CourseCard;